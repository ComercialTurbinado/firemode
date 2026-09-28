"use client";

import EspecialistaBloco from "./EspecialistaBloco";
import type { EspecialistaBloco as EspecialistaData } from "@/lib/especialista";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Card } from "@/components/AdminForm";
import { asDisplayText } from "@/lib/text-field";

export type BlogPost = {
  url?: string;
  titulo?: string | null;
  publicado?: string | null;
  fonte?: string | null;
};

export type BlogQualidade = {
  amostra_n?: number;
  amostra_pedida?: number;
  amostra_pct?: number;
  total_posts?: number;
  regra_amostragem?: string;
  resumo?: string;
  tom?: {
    personalidade?: string;
    lexico_recorrente?: string[];
    nivel_tecnico?: string;
    proximidade?: string;
    evitar?: string[];
  };
  pontos_fortes?: string[];
  gaps_conteudo?: { gap: string; impacto?: string; como_corrigir?: string }[];
  seo?: {
    nota?: number;
    faixa?: string;
    o_que_funciona?: string[];
    o_que_falta?: string[];
    checklist_padrao?: { item: string; obrigatorio?: boolean }[];
  };
  seo_sinais?: {
    palavras_media?: number | null;
    pct_com_meta_description?: number;
    pct_com_3plus_h2?: number;
    links_internos_media?: number;
  };
  pilares_recorrentes?: string[];
  oportunidades_tema?: string[];
    especialista?: EspecialistaData | null;
  prompt_escrita?: string;
  posts_analisados?: { url?: string; titulo?: string | null; palavras?: number }[];
  atualizado_em?: string;
  erro_llm?: string;
};

export type BlogData = {
  tem_blog?: boolean;
  url?: string | null;
  posts_encontrados?: number;
  exemplos?: string[];
  posts?: BlogPost[];
  fontes?: string[];
  cobertura?: string;
  total_api_wp?: number | null;
  sitemap_posts_brutos?: number;
  atualizado_em?: string;
  qualidade?: BlogQualidade | null;
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontWeight: 600, fontSize: 11, color: "var(--fm-muted)",
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
  }}>
    {children}
  </p>
);

function notaColor(nota?: number) {
  if (nota == null) return "var(--fm-muted)";
  if (nota >= 80) return "var(--fm-green)";
  if (nota >= 65) return "#84cc16";
  if (nota >= 45) return "#eab308";
  return "var(--fm-red)";
}

export default function BlogPanel({
  analiseId,
  initial,
}: {
  analiseId: string;
  initial: BlogData | null | undefined;
}) {
  const router = useRouter();
  const [data, setData] = useState<BlogData | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [loadingQ, setLoadingQ] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [mostrar, setMostrar] = useState(40);
  const [showPrompt, setShowPrompt] = useState(false);

  async function atualizar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/conteudo/blog/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analise_web_id: analiseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao mapear blog");
      setData((json.blog as BlogData) ?? null);
      setMostrar(40);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function auditarQualidade() {
    setLoadingQ(true);
    setErro(null);
    try {
      const res = await fetch("/api/conteudo/blog/qualidade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analise_web_id: analiseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha na auditoria de qualidade");
      setData((json.blog as BlogData) ?? null);
      setShowPrompt(true);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoadingQ(false);
    }
  }

  const posts = useMemo(() => {
    const list: BlogPost[] = data?.posts?.length
      ? data.posts
      : (data?.exemplos || []).map((url) => ({ url, titulo: null as string | null }));
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((p) =>
      (p.titulo || "").toLowerCase().includes(term) || (p.url || "").toLowerCase().includes(term),
    );
  }, [data, q]);

  const total = data?.posts_encontrados ?? posts.length;
  const qual = data?.qualidade;
  const busy = loading || loadingQ;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 14 }}>Blog — análise de qualidade</h2>
          <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 4 }}>
            Amostra ~12% (8–20 posts): tom, SEO, gaps e prompt fixo para os próximos artigos.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={atualizar}
            disabled={busy}
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: busy ? "var(--fm-overlay)" : "transparent",
              color: busy ? "var(--fm-muted)" : "inherit",
              border: "1px solid var(--fm-border)", cursor: busy ? "wait" : "pointer",
            }}
          >
            {loading ? "Mapeando…" : data?.posts_encontrados ? "Atualizar inventário" : "Mapear blog"}
          </button>
          <button
            type="button"
            onClick={auditarQualidade}
            disabled={busy || !(data?.posts_encontrados || 0)}
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: busy || !(data?.posts_encontrados) ? "var(--fm-overlay)" : "var(--fm-accent)",
              color: busy || !(data?.posts_encontrados) ? "var(--fm-muted)" : "#fff",
              border: "none", cursor: busy || !(data?.posts_encontrados) ? "wait" : "pointer",
            }}
          >
            {loadingQ ? "Analisando amostra…" : qual?.prompt_escrita ? "Reanalisar qualidade" : "Analisar tom & SEO"}
          </button>
        </div>
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

      {!data?.tem_blog && !busy && (
        <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>
          Blog ainda não mapeado. Clique em Mapear blog.
        </p>
      )}

      {qual && (
        <div style={{
          display: "flex", flexDirection: "column", gap: 14, marginBottom: 18,
          padding: 14, borderRadius: 12, border: "1px solid var(--fm-border)",
          background: "var(--fm-inset)",
        }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ textAlign: "center", minWidth: 88 }}>
              <p style={{ fontSize: 11, color: "var(--fm-muted)", textTransform: "uppercase" }}>SEO</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: notaColor(qual.seo?.nota) }}>
                {qual.seo?.nota != null ? Math.round(qual.seo.nota) : "—"}
              </p>
              <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>{qual.seo?.faixa || "—"}</p>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <Label>Análise da amostra</Label>
              <p style={{ fontSize: 13 }}>
                {qual.amostra_n} posts lidos de {qual.total_posts?.toLocaleString("pt-BR") ?? "—"}
                {qual.regra_amostragem ? ` · regra ${qual.regra_amostragem}` : ""}
              </p>
              {qual.resumo && (
                <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{qual.resumo}</p>
              )}
              {asDisplayText(qual.tom?.personalidade) && (
                <p style={{ fontSize: 12, marginTop: 8, whiteSpace: "pre-wrap" }}>
                  <strong>Tom:</strong> {asDisplayText(qual.tom?.personalidade)}
                  {asDisplayText(qual.tom?.proximidade) ? ` · ${asDisplayText(qual.tom?.proximidade)}` : ""}
                  {asDisplayText(qual.tom?.nivel_tecnico) ? ` · ${asDisplayText(qual.tom?.nivel_tecnico)}` : ""}
                </p>
              )}
            </div>
          </div>

          {!!qual.especialista && (
            <EspecialistaBloco data={qual.especialista} />
          )}

          {!!qual.pontos_fortes?.length && (
            <div>
              <Label>Pontos fortes</Label>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                {qual.pontos_fortes.map((x, i) => <li key={i}>{x}</li>)}
              </ul>
            </div>
          )}

          {!!qual.gaps_conteudo?.length && (
            <div>
              <Label>O que falta para ficar bom</Label>
              <div style={{ display: "grid", gap: 8 }}>
                {qual.gaps_conteudo.map((g, i) => (
                  <div key={i} style={{ fontSize: 13 }}>
                    <p style={{ fontWeight: 600 }}>
                      {g.gap}
                      {g.impacto ? <span style={{ color: "var(--fm-muted)", fontWeight: 500 }}> · {g.impacto}</span> : null}
                    </p>
                    {g.como_corrigir && (
                      <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 2 }}>{g.como_corrigir}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!qual.seo?.o_que_falta?.length && (
            <div>
              <Label>SEO — o que falta</Label>
              <p style={{ fontSize: 13 }}>{qual.seo.o_que_falta.join(" · ")}</p>
              {qual.seo_sinais && (
                <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 6 }}>
                  média {qual.seo_sinais.palavras_media ?? "—"} palavras
                  {qual.seo_sinais.pct_com_meta_description != null
                    ? ` · ${qual.seo_sinais.pct_com_meta_description}% com meta`
                    : ""}
                  {qual.seo_sinais.pct_com_3plus_h2 != null
                    ? ` · ${qual.seo_sinais.pct_com_3plus_h2}% com 3+ H2`
                    : ""}
                  {qual.seo_sinais.links_internos_media != null
                    ? ` · ${qual.seo_sinais.links_internos_media} links internos/post`
                    : ""}
                </p>
              )}
            </div>
          )}

          {!!qual.tom?.evitar?.length && (
            <div>
              <Label>Evitar na redação</Label>
              <p style={{ fontSize: 13 }}>{qual.tom.evitar.join(" · ")}</p>
            </div>
          )}

          {!!qual.seo?.checklist_padrao?.length && (
            <div>
              <Label>Checklist dos próximos artigos</Label>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                {qual.seo.checklist_padrao.map((c, i) => (
                  <li key={i}>{c.item}{c.obrigatorio ? " (obrigatório)" : ""}</li>
                ))}
              </ul>
            </div>
          )}

          {qual.prompt_escrita && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <Label>Prompt padrão para próximos artigos</Label>
                <button
                  type="button"
                  onClick={() => setShowPrompt((v) => !v)}
                  style={{
                    fontSize: 11, border: "none", background: "transparent",
                    color: "var(--fm-accent)", cursor: "pointer", fontWeight: 600,
                  }}
                >
                  {showPrompt ? "ocultar" : "mostrar"}
                </button>
              </div>
              <p style={{ fontSize: 12, color: "var(--fm-muted)", marginBottom: 6 }}>
                Já entra automaticamente na geração de conteúdo desta análise.
              </p>
              {showPrompt && (
                <pre style={{
                  whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12,
                  lineHeight: 1.45, padding: 12, borderRadius: 8, margin: 0,
                  background: "var(--fm-overlay)", border: "1px solid var(--fm-border)",
                  maxHeight: 320, overflow: "auto", fontFamily: "inherit",
                }}>
                  {qual.prompt_escrita}
                </pre>
              )}
            </div>
          )}

          {qual.atualizado_em && (
            <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
              Qualidade atualizada {new Date(qual.atualizado_em).toLocaleString("pt-BR")}
            </p>
          )}
        </div>
      )}

      {data?.tem_blog && !qual && !busy && (
        <p style={{ fontSize: 13, color: "var(--fm-muted)", marginBottom: 14 }}>
          Inventário ok ({total.toLocaleString("pt-BR")} posts). Clique em <strong>Analisar tom & SEO</strong> para gerar a análise e o prompt.
        </p>
      )}

      {data?.tem_blog && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "baseline" }}>
            <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>
              {total.toLocaleString("pt-BR")}
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fm-muted)", marginLeft: 8 }}>
                posts no inventário
              </span>
            </p>
            {data.cobertura && (
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                padding: "4px 8px", borderRadius: 6,
                background: data.cobertura === "completa" ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)",
                color: data.cobertura === "completa" ? "var(--fm-green)" : "#ca8a04",
              }}>
                cobertura {data.cobertura}
              </span>
            )}
          </div>

          {data.url && (
            <p style={{ fontSize: 12, color: "var(--fm-muted)", wordBreak: "break-all" }}>
              Índice:{" "}
              <a href={data.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--fm-accent)" }}>
                {data.url}
              </a>
            </p>
          )}

          <div>
            <Label>Buscar no inventário</Label>
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setMostrar(40); }}
              placeholder="título ou URL…"
              style={{
                width: "100%", maxWidth: 420, padding: "8px 10px", borderRadius: 8,
                border: "1px solid var(--fm-border)", background: "var(--fm-inset)",
                color: "inherit", fontSize: 13,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflow: "auto" }}>
            {posts.slice(0, mostrar).map((p, i) => (
              <a
                key={p.url || i}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block", padding: "8px 10px", borderRadius: 8, textDecoration: "none",
                  color: "inherit", background: "var(--fm-inset)", border: "1px solid var(--fm-border)",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600 }}>
                  {p.titulo || p.url?.split("/").filter(Boolean).pop() || "post"}
                </p>
                <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2, wordBreak: "break-all" }}>
                  {p.url}
                  {p.fonte ? ` · ${p.fonte}` : ""}
                </p>
              </a>
            ))}
          </div>

          {posts.length > mostrar && (
            <button
              type="button"
              onClick={() => setMostrar((n) => n + 60)}
              style={{
                alignSelf: "flex-start", padding: "6px 12px", borderRadius: 8, fontSize: 12,
                border: "1px solid var(--fm-border)", background: "transparent",
                color: "inherit", cursor: "pointer",
              }}
            >
              Mostrar mais ({posts.length - mostrar} restantes nesta vista)
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
