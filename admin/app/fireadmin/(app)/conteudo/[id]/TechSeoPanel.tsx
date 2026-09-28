"use client";

import EspecialistaBloco from "./EspecialistaBloco";
import type { EspecialistaBloco as EspecialistaData } from "@/lib/especialista";
import { TermoLabel } from "./TermoHint";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/AdminForm";

export type TechSeoData = {
  url_auditada?: string;
  url_final?: string;
  erro?: string | null;
  atualizado_em?: string;
  https?: { ok?: boolean; detalhe?: string };
  meta?: {
    title?: string;
    description?: string;
    canonical?: string | null;
    lang?: string | null;
    robots?: string;
    og?: { title?: string | null; description?: string | null; image?: string | null };
  };
  mobile?: { viewport_ok?: boolean; viewport_content?: string | null };
  schema?: { tipos?: string[]; blocos?: number };
  sitemap?: { url?: string | null; total_urls?: number; fonte?: string | null; ok?: boolean };
  ai_prep?: {
    llms_txt?: {
      ok?: boolean;
      url?: string | null;
      bytes?: number;
      detalhe?: string;
      quality_ok?: boolean;
      sample?: string;
    };
    llms_txt_gerado?: {
      conteudo?: string;
      bytes?: number;
      url_destino?: string;
      gerado_em?: string;
    };
    bots?: Record<string, "allow" | "block" | "unknown" | string>;
    bots_ok?: boolean;
    bots_blocked?: string[];
    score?: { ok?: number; total?: number };
  };
  pagespeed?: {
    ok?: boolean;
    erro?: string | null;
    performance_mobile?: number | null;
    performance_desktop?: number | null;
    atualizado_em?: string;
    mobile?: {
      ok?: boolean;
      scores?: {
        performance?: number | null;
        accessibility?: number | null;
        best_practices?: number | null;
        seo?: number | null;
      };
      metrics?: Record<string, { display?: string; score?: number | null } | undefined>;
      field_data?: { overall?: string } | null;
    };
    desktop?: {
      ok?: boolean;
      scores?: { performance?: number | null };
      metrics?: Record<string, { display?: string; score?: number | null } | undefined>;
    } | null;
  };
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

function psiColor(score?: number | null) {
  if (score == null) return "var(--fm-muted)";
  if (score >= 90) return "var(--fm-green)";
  if (score >= 50) return "#eab308";
  return "var(--fm-red)";
}

function PsiScore({ label, score }: { label: string; score?: number | null }) {
  return (
    <div style={{ textAlign: "center", minWidth: 72 }}>
      <p style={{
        fontSize: 28, fontWeight: 800, fontVariantNumeric: "tabular-nums",
        color: psiColor(score), letterSpacing: "-0.03em", lineHeight: 1,
      }}>
        {score != null ? score : "—"}
      </p>
      <p style={{ fontSize: 10, fontWeight: 600, color: "var(--fm-muted)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
    </div>
  );
}

function txt(value: unknown, fallback = "—"): string {
  if (value == null || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

export default function TechSeoPanel({
  analiseId,
  initial,
}: {
  analiseId: string;
  initial: TechSeoData | null | undefined;
}) {
  const router = useRouter();
  const [tech, setTech] = useState<TechSeoData | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [gerandoLlms, setGerandoLlms] = useState(false);
  const [llmsErro, setLlmsErro] = useState<string | null>(null);
  const [llmsPreview, setLlmsPreview] = useState<string | null>(
    initial?.ai_prep?.llms_txt_gerado?.conteudo ?? null,
  );
  const [llmsMeta, setLlmsMeta] = useState<{
    url_destino?: string;
    bytes?: number;
    aviso?: string;
    ja_publicado?: boolean;
  } | null>(
    initial?.ai_prep?.llms_txt_gerado
      ? {
          url_destino: initial.ai_prep.llms_txt_gerado.url_destino,
          bytes: initial.ai_prep.llms_txt_gerado.bytes,
        }
      : null,
  );
  const [copiado, setCopiado] = useState(false);

  async function atualizar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/conteudo/tech-seo/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analise_web_id: analiseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao atualizar Tech/SEO");
      setTech((data.tech_seo as TechSeoData) ?? null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function gerarLlms() {
    setGerandoLlms(true);
    setLlmsErro(null);
    setCopiado(false);
    try {
      const res = await fetch("/api/conteudo/tech-seo/llms-txt/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analise_web_id: analiseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao gerar llms.txt");
      setLlmsPreview(typeof data.conteudo === "string" ? data.conteudo : null);
      setLlmsMeta({
        url_destino: data.url_destino,
        bytes: data.bytes,
        aviso: data.aviso,
        ja_publicado: data.ja_publicado,
      });
      if (data.tech_seo) setTech(data.tech_seo as TechSeoData);
      router.refresh();
    } catch (e) {
      setLlmsErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setGerandoLlms(false);
    }
  }

  async function copiarLlms() {
    if (!llmsPreview) return;
    try {
      await navigator.clipboard.writeText(llmsPreview);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setLlmsErro("Não foi possível copiar — selecione o texto manualmente.");
    }
  }

  function baixarLlms() {
    if (!llmsPreview) return;
    const blob = new Blob([llmsPreview], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "llms.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const nota = tech?.nota_interna?.nota;
  const temAuditoria = !!tech && (!!tech.checklist?.length || tech.nota_interna != null || !!tech.erro);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        <SectionTitle sub="HTTPS, meta, mobile, schema, sitemap, robots, llms.txt, crawlers de IA e PageSpeed da home.">
          Tech / SEO on-page
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
          {loading ? "Atualizando…" : temAuditoria ? "Atualizar Tech/SEO" : "Auditar Tech/SEO"}
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
          Ainda sem auditoria técnica nesta análise. Clique em <b>Auditar Tech/SEO</b> para checar a home.
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
                  nota interna · {tech.nota_interna?.faixa}
                </span>
              </span>
            )}
            {tech.score && (
              <span style={{ fontSize: 12, color: "var(--fm-muted)", fontVariantNumeric: "tabular-nums" }}>
                checklist {tech.score.ok ?? 0}/{tech.score.total ?? 0}
              </span>
            )}
            {tech.prioridade && (
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                padding: "3px 10px", borderRadius: 20,
                background: "var(--fm-hover)", color: "var(--fm-muted)",
              }}>
                prioridade {txt(tech.prioridade, "")}
              </span>
            )}
            {tech.atualizado_em && (
              <span style={{ fontSize: 11, color: "var(--fm-muted)" }}>
                atualizado {new Date(tech.atualizado_em).toLocaleString("pt-BR")}
              </span>
            )}
          </div>

          {tech.nota_interna?.breakdown && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(tech.nota_interna.breakdown).map(([k, v]) => (
                <span key={k} style={{
                  fontSize: 11, color: "var(--fm-muted)", background: "var(--fm-inset)",
                  border: "1px solid var(--fm-border)", borderRadius: 6, padding: "3px 8px",
                }}>
                  {k.replace("_", " ")}: <b style={{ color: "var(--fm-text)" }}>{v}</b>
                </span>
              ))}
            </div>
          )}

          {!!tech.historico_notas && tech.historico_notas.length > 1 && (
            <div>
              <Label>Histórico da nota</Label>
              <p style={{ fontSize: 12, color: "var(--fm-muted)" }}>
                {tech.historico_notas.map((h) => h.nota).join(" → ")}
              </p>
            </div>
          )}

          {tech.resumo && <p style={{ fontSize: 13, lineHeight: 1.55 }}>{txt(tech.resumo, "")}</p>}
          {tech.erro && <p style={{ fontSize: 12, color: "var(--fm-red)" }}>{txt(tech.erro, "")}</p>}

          {tech.pagespeed && (
            <div style={{
              padding: 14, background: "var(--fm-inset)", borderRadius: 8,
              border: "1px solid var(--fm-border)",
            }}>
              <p style={{
                fontWeight: 600, fontSize: 11, color: "var(--fm-muted)",
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
                display: "flex", alignItems: "center",
              }}>
                <TermoLabel glossKey="pagespeed insights">PageSpeed Insights</TermoLabel>
              </p>
              {tech.pagespeed.erro && !tech.pagespeed.ok ? (
                <p style={{ fontSize: 12, color: "var(--fm-red)", marginTop: 4 }}>{txt(tech.pagespeed.erro, "")}</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-end" }}>
                    <PsiScore label="Mobile" score={tech.pagespeed.performance_mobile} />
                    <PsiScore label="Desktop" score={tech.pagespeed.performance_desktop} />
                    {tech.pagespeed.mobile?.scores && (
                      <>
                        <PsiScore label="A11y" score={tech.pagespeed.mobile.scores.accessibility} />
                        <PsiScore label="Best practices" score={tech.pagespeed.mobile.scores.best_practices} />
                        <PsiScore label="SEO lab" score={tech.pagespeed.mobile.scores.seo} />
                      </>
                    )}
                  </div>
                  {!!tech.pagespeed.mobile?.metrics && Object.keys(tech.pagespeed.mobile.metrics).length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {([
                        { key: "lcp", label: "LCP", gloss: "lcp" },
                        { key: "cls", label: "CLS", gloss: "cls" },
                        { key: "tbt", label: "TBT", gloss: "tbt" },
                        { key: "fcp", label: "FCP", gloss: "fcp" },
                        { key: "speed_index", label: "Speed Index", gloss: "speed index" },
                        { key: "tti", label: "TTI", gloss: "tti" },
                      ] as const).map(({ key, label, gloss }) => {
                        const m = tech.pagespeed?.mobile?.metrics?.[key];
                        if (!m?.display) return null;
                        return (
                          <span key={key} style={{
                            fontSize: 11, color: "var(--fm-muted)", background: "var(--fm-hover)",
                            border: "1px solid var(--fm-border)", borderRadius: 6, padding: "4px 8px",
                            display: "inline-flex", alignItems: "center",
                          }}>
                            <TermoLabel glossKey={gloss}>{label}</TermoLabel>
                            {": "}
                            <b style={{ color: psiColor(m.score) }}>{m.display}</b>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {tech.pagespeed.mobile?.field_data?.overall && (
                    <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
                      <TermoLabel glossKey="field data">Field data</TermoLabel>
                      {" ("}
                      <TermoLabel glossKey="crux">CrUX</TermoLabel>
                      {"): "}
                      {txt(tech.pagespeed.mobile.field_data.overall, "")}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12, padding: 14, background: "var(--fm-inset)", borderRadius: 8,
            border: "1px solid var(--fm-border)",
          }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>URL final</Label>
              <p style={{ fontSize: 13, wordBreak: "break-all" }}>{txt(tech.url_final || tech.url_auditada)}</p>
            </div>
            <div>
              <Label>Title</Label>
              <p style={{ fontSize: 13 }}>{txt(tech.meta?.title)}</p>
            </div>
            <div>
              <Label>Meta description</Label>
              <p style={{ fontSize: 13 }}>{txt(tech.meta?.description)}</p>
            </div>
            <div>
              <Label>Canonical</Label>
              <p style={{ fontSize: 13, wordBreak: "break-all" }}>{txt(tech.meta?.canonical)}</p>
            </div>
            <div>
              <Label>Viewport</Label>
              <p style={{ fontSize: 13 }}>{txt(tech.mobile?.viewport_content)}</p>
            </div>
            <div>
              <Label>Schema</Label>
              <p style={{ fontSize: 13 }}>
                {(tech.schema?.tipos?.length)
                  ? tech.schema.tipos.join(", ")
                  : "—"}
              </p>
            </div>
            <div>
              <Label>Sitemap</Label>
              <p style={{ fontSize: 13 }}>
                {tech.sitemap?.ok
                  ? `${tech.sitemap.total_urls ?? 0} URLs`
                  : "não encontrado"}
              </p>
            </div>
            <div>
              <Label>
                <TermoLabel glossKey="llms.txt">llms.txt</TermoLabel>
              </Label>
              <p style={{ fontSize: 13 }}>
                {tech.ai_prep?.llms_txt?.ok
                  ? txt(tech.ai_prep.llms_txt.detalhe, "encontrado")
                  : "não encontrado"}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => void gerarLlms()}
                  disabled={gerandoLlms}
                  style={{
                    padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                    background: gerandoLlms ? "var(--fm-overlay)" : "var(--fm-surface)",
                    color: "var(--fm-text)",
                    border: "1px solid var(--fm-border)",
                    cursor: gerandoLlms ? "wait" : "pointer",
                  }}
                >
                  {gerandoLlms ? "Gerando…" : llmsPreview ? "Regenerar llms.txt" : "Gerar llms.txt"}
                </button>
                {llmsPreview ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void copiarLlms()}
                      style={{
                        padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: "var(--fm-surface)", color: "var(--fm-accent)",
                        border: "1px solid var(--fm-border)", cursor: "pointer",
                      }}
                    >
                      {copiado ? "Copiado ✓" : "Copiar"}
                    </button>
                    <button
                      type="button"
                      onClick={baixarLlms}
                      style={{
                        padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: "var(--fm-surface)", color: "var(--fm-text)",
                        border: "1px solid var(--fm-border)", cursor: "pointer",
                      }}
                    >
                      Baixar
                    </button>
                  </>
                ) : null}
              </div>
              {llmsErro ? (
                <p style={{ fontSize: 11, color: "var(--fm-red)", marginTop: 6 }}>{llmsErro}</p>
              ) : null}
              {llmsMeta?.aviso ? (
                <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 6, lineHeight: 1.4 }}>
                  {llmsMeta.aviso}
                  {llmsMeta.url_destino ? ` Destino: ${llmsMeta.url_destino}.` : ""}
                  {llmsMeta.ja_publicado ? " (já há um llms.txt no ar — compare antes de substituir.)" : ""}
                </p>
              ) : null}
              {llmsPreview ? (
                <pre style={{
                  marginTop: 10, maxHeight: 220, overflow: "auto",
                  fontSize: 11, lineHeight: 1.45, padding: "10px 12px",
                  background: "var(--fm-inset)", border: "1px solid var(--fm-border)",
                  borderRadius: 8, whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                  {llmsPreview}
                </pre>
              ) : null}
            </div>
            <div>
              <Label>
                <TermoLabel glossKey="crawlers de ia">Crawlers de IA</TermoLabel>
              </Label>
              <p style={{ fontSize: 13 }}>
                {tech.ai_prep?.bots_ok
                  ? "liberados"
                  : tech.ai_prep?.bots_blocked?.length
                    ? `bloqueio: ${tech.ai_prep.bots_blocked.join(", ")}`
                    : tech.ai_prep?.bots
                      ? "parcial / desconhecido"
                      : "—"}
              </p>
            </div>
          </div>

          {!!tech.checklist?.length && (
            <div>
              <Label>Checklist técnico</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {tech.checklist.map((c) => (
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

          {!!tech.especialista && (
            <EspecialistaBloco data={tech.especialista} />
          )}

          {!!tech.melhorias_rapidas?.length && (
            <div>
              <Label>Melhorias rápidas</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {tech.melhorias_rapidas.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 14px", background: "var(--fm-inset)", borderRadius: 8,
                      border: "1px solid var(--fm-border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{i + 1}. {txt(m.titulo)}</p>
                      <span style={{ fontSize: 10, color: "var(--fm-muted)", flexShrink: 0, textTransform: "uppercase" }}>
                        {[m.impacto && `impacto ${txt(m.impacto, "")}`, m.esforco && `esforço ${txt(m.esforco, "")}`].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    {m.porque && <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4 }}>{txt(m.porque, "")}</p>}
                    {m.como && <p style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{txt(m.como, "")}</p>}
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
