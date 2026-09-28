"use client";

import EspecialistaBloco from "./EspecialistaBloco";
import type { EspecialistaBloco as EspecialistaData } from "@/lib/especialista";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/AdminForm";

export type TiktokPerfil = {
  id?: string;
  handle?: string;
  nome?: string;
  bio?: string | null;
  avatar?: string | null;
  url?: string | null;
  verificado?: boolean;
  seguidores?: number | null;
  likes_totais?: number | null;
  videos_count?: number | null;
};

export type TiktokVideo = {
  id?: string | null;
  titulo?: string | null;
  cover?: string | null;
  url?: string | null;
  views?: number | null;
  likes?: number | null;
  comentarios?: number | null;
  publicado?: string | null;
  duracao?: number | null;
  handle?: string | null;
  autor_nome?: string | null;
  query?: string | null;
};

export type TiktokHashtag = {
  nome?: string;
  hashtag?: string;
  views?: number | null;
  users?: number | null;
  url?: string | null;
  mencoes?: number;
  views_proxy?: number;
};

export type TiktokTendencias = {
  ok?: boolean;
  queries?: string[];
  queries_hashtag?: string[];
  videos?: TiktokVideo[];
  hashtags?: TiktokHashtag[];
  hashtags_nos_videos?: TiktokHashtag[];
  erro?: string | null;
};

export type TiktokMetricas = {
  amostra?: number;
  views?: { mediana?: number | null; media?: number | null; total?: number | null };
  likes?: { mediana?: number | null; media?: number | null };
  comentarios?: { mediana?: number | null };
  titulos?: { tam_medio?: number | null; com_hashtag?: number; amostra?: string[] };
  periodicidade?: {
    ritmo?: string;
    ultimo_dias?: number | null;
    intervalo_mediano_dias?: number | null;
    posts_por_semana?: number | null;
    detalhe?: string;
  };
  engajamento_proxy?: { valor?: number | null; metrica?: string };
  itens?: TiktokVideo[];
};

export type TiktokComparativo = {
  papel?: string;
  nome?: string;
  handle?: string | null;
  seguidores?: number | null;
  ritmo?: string | null;
  posts_por_semana?: number | null;
  ultimo_dias?: number | null;
  views_mediana?: number | null;
  likes_mediana?: number | null;
  url?: string | null;
};

export type TiktokData = {
  empresa?: string;
  fonte?: string;
  query?: string;
  erro?: string | null;
  aviso?: string | null;
  atualizado_em?: string;
  link_site?: { url?: string | null; perfil?: string | null; handle?: string | null } | null;
  perfil?: TiktokPerfil | null;
  metricas?: TiktokMetricas | null;
  videos?: TiktokVideo[];
  concorrentes?: {
    nome?: string;
    dominio?: string | null;
    handle?: string | null;
    fonte_handle?: string | null;
    perfil?: TiktokPerfil | null;
    metricas?: TiktokMetricas | null;
    videos?: TiktokVideo[];
    erro?: string | null;
  }[];
  comparativo_presenca?: TiktokComparativo[];
  gap_vs_concorrentes?: string | null;
  tendencias?: TiktokTendencias | null;
  angulos_tendencia?: {
    titulo: string;
    gancho?: string;
    hashtags?: string[];
    porque?: string;
    formato?: string;
  }[];
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

function fmtNum(n?: number | null) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString("pt-BR");
}

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
}

function VideosGrid({ titulo, itens }: { titulo: string; itens: TiktokVideo[] }) {
  if (!itens.length) return null;
  return (
    <div>
      <Label>{titulo}</Label>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
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
              aspectRatio: "9 / 14",
              background: "var(--fm-overlay)", position: "relative",
            }}>
              {it.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.cover}
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
                {fmtNum(it.views)} views · {fmtNum(it.likes)} likes
                {it.publicado ? ` · ${fmtDate(it.publicado)}` : ""}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function TiktokPanel({
  analiseId,
  initial,
}: {
  analiseId: string;
  initial: TiktokData | null | undefined;
}) {
  const router = useRouter();
  const [data, setData] = useState<TiktokData | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function atualizar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/conteudo/tiktok/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analise_web_id: analiseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao atualizar TikTok");
      setData((json.tiktok as TiktokData) ?? null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const nota = data?.nota_interna?.nota;
  const perfil = data?.perfil;
  const metricas = data?.metricas;
  const temAuditoria = !!data && (!!data.checklist?.length || data.nota_interna != null || !!data.erro);
  const comparativo = data?.comparativo_presenca || [];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        <SectionTitle sub="Perfil, ritmo, concorrentes SERP e tendências do mercado (vídeos + hashtags do nicho).">
          TikTok
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
          {loading ? "Atualizando…" : temAuditoria ? "Atualizar TikTok" : "Auditar TikTok"}
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

      {!temAuditoria && !loading && (
        <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>
          Ainda sem auditoria. Clique em Auditar TikTok para buscar o perfil (site → @) e comparar com concorrentes.
        </p>
      )}

      {temAuditoria && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{
              minWidth: 100, padding: "14px 18px", borderRadius: 12,
              background: "var(--fm-inset)", border: "1px solid var(--fm-border)",
              textAlign: "center",
            }}>
              <p style={{ fontSize: 11, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Nota
              </p>
              <p style={{ fontSize: 32, fontWeight: 800, color: notaColor(nota), lineHeight: 1.1, marginTop: 4 }}>
                {nota != null ? Math.round(nota) : "—"}
              </p>
              <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 2 }}>
                {data?.nota_interna?.faixa || "—"}
              </p>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              {perfil ? (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {perfil.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={perfil.avatar}
                      alt=""
                      style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : null}
                  <div>
                    <a
                      href={perfil.url || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontWeight: 700, fontSize: 15, color: "inherit", textDecoration: "none" }}
                    >
                      @{perfil.handle}
                      {perfil.verificado ? " ✓" : ""}
                    </a>
                    <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>{perfil.nome}</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>
                      {fmtNum(perfil.seguidores)} seguidores · {fmtNum(perfil.likes_totais)} likes · {fmtNum(perfil.videos_count)} vídeos
                    </p>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>
                  {data?.erro || "Perfil não encontrado"}
                </p>
              )}
              {data?.link_site?.handle && (
                <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 8 }}>
                  Site → @{data.link_site.handle}
                </p>
              )}
              {data?.aviso && (
                <p style={{ fontSize: 12, color: "#eab308", marginTop: 8 }}>{data.aviso}</p>
              )}
              {metricas?.periodicidade && (
                <p style={{ fontSize: 12, marginTop: 8 }}>
                  Ritmo: <strong>{metricas.periodicidade.ritmo}</strong>
                  {metricas.periodicidade.detalhe ? ` · ${metricas.periodicidade.detalhe}` : ""}
                </p>
              )}
            </div>
          </div>

          {data?.resumo && (
            <div>
              <Label>Resumo</Label>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>{data.resumo}</p>
            </div>
          )}

          {data?.gap_vs_concorrentes && (
            <p style={{
              fontSize: 13, padding: "10px 12px", borderRadius: 8,
              background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)",
            }}>
              {data.gap_vs_concorrentes}
            </p>
          )}

          {data?.tendencias && (data.tendencias.videos?.length || data.tendencias.hashtags?.length) ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <Label>Tendências do mercado</Label>
                <p style={{ fontSize: 12, color: "var(--fm-muted)", marginBottom: 8 }}>
                  Buscas: {(data.tendencias.queries || []).slice(0, 4).join(" · ") || "—"}
                  {data.tendencias.erro ? ` · aviso: ${data.tendencias.erro}` : ""}
                </p>
              </div>

              {!!data.tendencias.hashtags?.length && (
                <div>
                  <Label>Hashtags com volume</Label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {data.tendencias.hashtags.slice(0, 10).map((h, i) => (
                      <a
                        key={h.hashtag || i}
                        href={h.url || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: "none", color: "inherit",
                          padding: "6px 10px", borderRadius: 8, fontSize: 12,
                          background: "var(--fm-inset)", border: "1px solid var(--fm-border)",
                        }}
                      >
                        <strong>{h.hashtag || `#${h.nome}`}</strong>
                        <span style={{ color: "var(--fm-muted)", marginLeft: 6 }}>
                          {fmtNum(h.views)} views
                          {h.users != null ? ` · ${fmtNum(h.users)} users` : ""}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!!data.tendencias.hashtags_nos_videos?.length && (
                <div>
                  <Label>Hashtags recorrentes nos vídeos do nicho</Label>
                  <p style={{ fontSize: 12, color: "var(--fm-muted)" }}>
                    {data.tendencias.hashtags_nos_videos.slice(0, 12).map((h) => (
                      <span key={h.hashtag || h.nome} style={{ marginRight: 10 }}>
                        {h.hashtag || `#${h.nome}`} ({h.mencoes}×)
                      </span>
                    ))}
                  </p>
                </div>
              )}

              <VideosGrid
                titulo="Vídeos em alta no nicho"
                itens={data.tendencias.videos || []}
              />
            </div>
          ) : null}

          {!!data?.angulos_tendencia?.length && (
            <div>
              <Label>Ângulos alinhados às tendências</Label>
              <div style={{ display: "grid", gap: 10 }}>
                {data.angulos_tendencia.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 14px", borderRadius: 10,
                      background: "var(--fm-inset)", border: "1px solid var(--fm-border)",
                    }}
                  >
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{a.titulo}</p>
                    {a.gancho && (
                      <p style={{ fontSize: 12, marginTop: 4, fontStyle: "italic" }}>
                        “{a.gancho}”
                      </p>
                    )}
                    {a.porque && (
                      <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 6 }}>{a.porque}</p>
                    )}
                    <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 6 }}>
                      {a.formato || "—"}
                      {a.hashtags?.length ? ` · ${a.hashtags.join(" ")}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {comparativo.length > 0 && (
            <div>
              <Label>Comparativo de presença</Label>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "var(--fm-muted)" }}>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>Quem</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>@</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>Seguidores</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>Ritmo</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>/sem</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>Views med.</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>Likes med.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparativo.map((row, i) => (
                      <tr key={i} style={{ borderTop: "1px solid var(--fm-border)" }}>
                        <td style={{ padding: "8px", fontWeight: row.papel === "cliente" ? 700 : 400 }}>
                          {row.papel === "cliente" ? "Cliente" : row.nome}
                        </td>
                        <td style={{ padding: "8px" }}>
                          {row.url ? (
                            <a href={row.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--fm-accent)" }}>
                              @{row.handle}
                            </a>
                          ) : `@${row.handle || "—"}`}
                        </td>
                        <td style={{ padding: "8px" }}>{fmtNum(row.seguidores)}</td>
                        <td style={{ padding: "8px" }}>{row.ritmo || "—"}</td>
                        <td style={{ padding: "8px" }}>{row.posts_por_semana ?? "—"}</td>
                        <td style={{ padding: "8px" }}>{fmtNum(row.views_mediana)}</td>
                        <td style={{ padding: "8px" }}>{fmtNum(row.likes_mediana)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <VideosGrid titulo="Vídeos recentes (cliente)" itens={data?.videos || metricas?.itens || []} />

          {(data?.concorrentes || []).filter((c) => (c.videos?.length || 0) > 0).slice(0, 4).map((c, i) => (
            <VideosGrid
              key={c.handle || i}
              titulo={`@${c.handle} · ${c.nome || "concorrente"}`}
              itens={c.videos || []}
            />
          ))}

          {!!data?.checklist?.length && (
            <div>
              <Label>Checklist ({data.score?.ok}/{data.score?.total})</Label>
              <div style={{ display: "grid", gap: 6 }}>
                {data.checklist.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex", gap: 10, alignItems: "flex-start",
                      padding: "8px 10px", borderRadius: 8,
                      background: "var(--fm-inset)", border: "1px solid var(--fm-border)",
                    }}
                  >
                    <span style={{ color: item.ok ? "var(--fm-green)" : "var(--fm-red)", fontWeight: 700 }}>
                      {item.ok ? "✓" : "✗"}
                    </span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: "var(--fm-muted)" }}>{item.detalhe}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!data?.especialista && (
            <EspecialistaBloco data={data.especialista} />
          )}

          {!!data?.melhorias_rapidas?.length && (
            <div>
              <Label>Melhorias rápidas</Label>
              <div style={{ display: "grid", gap: 10 }}>
                {data.melhorias_rapidas.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 14px", borderRadius: 10,
                      background: "var(--fm-inset)", border: "1px solid var(--fm-border)",
                    }}
                  >
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{m.titulo}</p>
                    {m.porque && <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4 }}>{m.porque}</p>}
                    {m.como && <p style={{ fontSize: 12, marginTop: 6 }}>{m.como}</p>}
                    <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 6 }}>
                      esforço {m.esforco || "—"} · impacto {m.impacto || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data?.atualizado_em && (
            <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
              Atualizado {new Date(data.atualizado_em).toLocaleString("pt-BR")}
              {data.custo?.consultas != null ? ` · ${data.custo.consultas} consultas RapidAPI` : ""}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
