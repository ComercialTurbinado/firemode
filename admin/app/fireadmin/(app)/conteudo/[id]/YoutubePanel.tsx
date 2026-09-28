"use client";

import EspecialistaBloco from "./EspecialistaBloco";
import type { EspecialistaBloco as EspecialistaData } from "@/lib/especialista";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/AdminForm";

export type YoutubeCanal = {
  id?: string;
  nome?: string;
  handle?: string;
  url?: string;
  inscritos?: number | null;
  inscritos_texto?: string | null;
  descricao?: string | null;
  thumbnail?: string | null;
  verificado?: boolean;
};

export type YoutubeItem = {
  id?: string | null;
  titulo?: string | null;
  tipo?: string;
  views?: number | null;
  publicado?: string | null;
  duracao?: string | null;
  thumbnail?: string | null;
  url?: string | null;
};

export type YoutubeMetricas = {
  videos?: {
    amostra?: number;
    views?: { mediana?: number | null; media?: number | null; total?: number | null };
    titulos?: { tam_medio?: number | null; com_pergunta?: number; com_numero?: number; amostra?: string[] };
    periodicidade?: {
      ritmo?: string;
      ultimo_dias?: number | null;
      intervalo_mediano_dias?: number | null;
      detalhe?: string;
    };
    itens?: YoutubeItem[];
  };
  shorts?: {
    amostra?: number;
    views?: { mediana?: number | null; media?: number | null; total?: number | null };
    titulos?: { tam_medio?: number | null; amostra?: string[] };
    itens?: YoutubeItem[];
  };
  engajamento_proxy?: { valor?: number | null; metrica?: string; nota?: string };
};

export type YoutubeData = {
  empresa?: string;
  fonte?: string;
  query?: string;
  erro?: string | null;
  aviso?: string | null;
  atualizado_em?: string;
  link_site?: { url?: string | null; perfil?: string | null; handle?: string | null } | null;
  canal?: YoutubeCanal | null;
  candidatos?: YoutubeCanal[];
  metricas?: YoutubeMetricas | null;
  videos?: YoutubeItem[];
  shorts?: YoutubeItem[];
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
  }[];
  especialista?: EspecialistaData | null;
  custo?: {
    consultas?: number;
    custo_usd?: number;
    preco_por_consulta?: number;
    plano?: string;
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

function fmtSubs(n?: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("pt-BR");
}

function fmtViews(n?: number | null) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString("pt-BR");
}

function ConteudoGrid({
  titulo,
  itens,
}: {
  titulo: string;
  itens: YoutubeItem[];
}) {
  if (!itens.length) return null;
  return (
    <div>
      <Label>{titulo}</Label>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 10,
      }}>
        {itens.slice(0, 8).map((it, i) => (
          <a
            key={it.id || i}
            href={it.url || undefined}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none", color: "inherit",
              background: "var(--fm-inset)", border: "1px solid var(--fm-border)",
              borderRadius: 10, overflow: "hidden", display: "block",
            }}
          >
            <div style={{
              aspectRatio: it.tipo === "short" ? "9 / 14" : "16 / 9",
              background: "var(--fm-overlay)", position: "relative",
            }}>
              {it.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.thumbnail}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : null}
            </div>
            <div style={{ padding: "8px 10px" }}>
              <p style={{
                fontSize: 12, fontWeight: 600, lineHeight: 1.35,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {it.titulo || "sem título"}
              </p>
              <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4 }}>
                {fmtViews(it.views)} views
                {it.publicado ? ` · ${it.publicado}` : ""}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function YoutubePanel({
  analiseId,
  initial,
}: {
  analiseId: string;
  initial: YoutubeData | null | undefined;
}) {
  const router = useRouter();
  const [data, setData] = useState<YoutubeData | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function atualizar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/conteudo/youtube/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analise_web_id: analiseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao atualizar YouTube");
      setData((json.youtube as YoutubeData) ?? null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const nota = data?.nota_interna?.nota;
  const canal = data?.canal;
  const metricas = data?.metricas;
  const temAuditoria = !!data && (!!data.checklist?.length || data.nota_interna != null || !!data.erro);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        <SectionTitle sub="Canal, vídeos e shorts: periodicidade, views, títulos/capas e proxy de engajamento.">
          YouTube
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
          {loading ? "Atualizando…" : temAuditoria ? "Atualizar YouTube" : "Auditar YouTube"}
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
          Ainda sem auditoria de YouTube nesta análise. Clique em <b>Auditar YouTube</b> para buscar o canal.
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
                fontSize: 11, color: "var(--fm-muted)", background: "var(--fm-hover)",
                padding: "3px 8px", borderRadius: 6,
              }}>
                query “{data.query}”
              </span>
            )}
            {data.custo?.consultas != null && (
              <span style={{ fontSize: 11, color: "var(--fm-muted)" }}>
                {data.custo.consultas} consulta(s) · US$ {Number(data.custo.custo_usd ?? 0).toFixed(4)}
              </span>
            )}
          </div>

          {data.erro && (
            <p style={{ fontSize: 12, color: "var(--fm-red)" }}>{data.erro}</p>
          )}

          {data.aviso && (
            <p style={{
              fontSize: 12, color: "var(--fm-yellow)",
              background: "rgba(161,98,7,0.1)", border: "1px solid rgba(161,98,7,0.25)",
              borderRadius: 8, padding: "8px 12px",
            }}>
              {data.aviso}
            </p>
          )}

          {data.resumo && (
            <p style={{ fontSize: 13, lineHeight: 1.5 }}>{data.resumo}</p>
          )}

          {canal && (
            <div style={{
              display: "flex", gap: 14, padding: 14, background: "var(--fm-inset)",
              borderRadius: 10, border: "1px solid var(--fm-border)", alignItems: "flex-start",
            }}>
              {canal.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={canal.thumbnail}
                  alt=""
                  width={56}
                  height={56}
                  style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", background: "var(--fm-overlay)",
                  flexShrink: 0,
                }} />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{canal.nome || "Canal"}</p>
                  {canal.verificado && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "var(--fm-blue)",
                      background: "rgba(37,99,235,0.12)", padding: "2px 7px", borderRadius: 6,
                    }}>
                      verificado
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 2 }}>
                  {canal.handle ? `@${canal.handle}` : "—"} · {fmtSubs(canal.inscritos)} inscritos
                </p>
                {canal.descricao && (
                  <p style={{ fontSize: 12, marginTop: 8, lineHeight: 1.45, color: "var(--fm-muted)" }}>
                    {canal.descricao}
                  </p>
                )}
                {canal.url && (
                  <a
                    href={canal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: "var(--fm-accent)", marginTop: 8, display: "inline-block" }}
                  >
                    Abrir canal →
                  </a>
                )}
              </div>
            </div>
          )}

          {data.link_site && (
            <div>
              <Label>Link no site</Label>
              <p style={{ fontSize: 13 }}>
                {data.link_site.handle ? `@${data.link_site.handle}` : data.link_site.url || "—"}
              </p>
            </div>
          )}

          {metricas && (
            <div>
              <Label>Métricas de conteúdo</Label>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 8,
              }}>
                {[
                  {
                    k: "Ritmo",
                    v: metricas.videos?.periodicidade?.ritmo || "—",
                    s: metricas.videos?.periodicidade?.detalhe,
                  },
                  {
                    k: "Vídeos (amostra)",
                    v: String(metricas.videos?.amostra ?? 0),
                    s: metricas.videos?.views?.mediana != null
                      ? `mediana ${fmtViews(metricas.videos.views.mediana)} views`
                      : undefined,
                  },
                  {
                    k: "Shorts (amostra)",
                    v: String(metricas.shorts?.amostra ?? 0),
                    s: metricas.shorts?.views?.mediana != null
                      ? `mediana ${fmtViews(metricas.shorts.views.mediana)} views`
                      : undefined,
                  },
                  {
                    k: "Títulos",
                    v: metricas.videos?.titulos?.tam_medio != null
                      ? `${metricas.videos.titulos.tam_medio} chars`
                      : "—",
                    s: metricas.videos?.titulos
                      ? `${metricas.videos.titulos.com_pergunta ?? 0} com ? · ${metricas.videos.titulos.com_numero ?? 0} com nº`
                      : undefined,
                  },
                  {
                    k: "Engajamento*",
                    v: metricas.engajamento_proxy?.valor != null
                      ? `${metricas.engajamento_proxy.valor}%`
                      : "—",
                    s: "proxy: views mediana / inscritos",
                  },
                ].map((c) => (
                  <div key={c.k} style={{
                    padding: "10px 12px", background: "var(--fm-inset)",
                    borderRadius: 10, border: "1px solid var(--fm-border)",
                  }}>
                    <p style={{ fontSize: 10, color: "var(--fm-muted)", fontWeight: 600, textTransform: "uppercase" }}>{c.k}</p>
                    <p style={{ fontSize: 16, fontWeight: 750, marginTop: 4, textTransform: "capitalize" }}>{c.v}</p>
                    {c.s && <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4 }}>{c.s}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <ConteudoGrid titulo="Vídeos recentes" itens={data.videos || metricas?.videos?.itens || []} />
          <ConteudoGrid titulo="Shorts" itens={data.shorts || metricas?.shorts?.itens || []} />

          {!!data.checklist?.length && (
            <div>
              <Label>Checklist</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {data.checklist.map((c) => (
                  <span
                    key={c.id}
                    title={c.detalhe}
                    style={{
                      fontSize: 11, padding: "5px 10px", borderRadius: 8,
                      background: c.ok ? "rgba(21,128,61,0.12)" : "var(--fm-hover)",
                      color: c.ok ? "var(--fm-green)" : "var(--fm-muted)",
                      border: `1px solid ${c.ok ? "rgba(21,128,61,0.25)" : "var(--fm-border)"}`,
                    }}
                  >
                    {c.ok ? "✓" : "·"} {c.label}
                  </span>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.melhorias_rapidas.slice(0, 6).map((m, i) => (
                  <div key={i} style={{
                    padding: "12px 14px", background: "var(--fm-inset)", borderRadius: 8,
                    border: "1px solid var(--fm-border)",
                  }}>
                    <p style={{ fontWeight: 650, fontSize: 13 }}>{m.titulo}</p>
                    {m.porque && <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4 }}>{m.porque}</p>}
                    {m.como && <p style={{ fontSize: 12, marginTop: 4 }}>{m.como}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!data.candidatos?.length && data.candidatos.length > 1 && (
            <div>
              <Label>Outros candidatos na busca</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {data.candidatos.filter((c) => c.id !== canal?.id).slice(0, 5).map((c) => (
                  <div key={c.id} style={{
                    display: "flex", justifyContent: "space-between", gap: 12,
                    fontSize: 12, padding: "8px 10px", background: "var(--fm-hover)", borderRadius: 8,
                  }}>
                    <span>
                      {c.nome}
                      {c.handle ? ` · @${c.handle}` : ""}
                    </span>
                    <span style={{ color: "var(--fm-muted)", flexShrink: 0 }}>
                      {fmtSubs(c.inscritos)} insc.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.atualizado_em && (
            <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
              Atualizado em {new Date(data.atualizado_em).toLocaleString("pt-BR")}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
