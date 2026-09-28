"use client";

import EspecialistaBloco from "./EspecialistaBloco";
import type { EspecialistaBloco as EspecialistaData } from "@/lib/especialista";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/AdminForm";

export type InstagramPerfil = {
  username?: string;
  nome?: string | null;
  bio?: string | null;
  seguidores?: number | null;
  posts_total?: number | null;
  verificado?: boolean;
  privado?: boolean;
  avatar?: string | null;
  url?: string | null;
};

export type InstagramPeriodicidade = {
  ritmo?: string;
  ultimo_dias?: number | null;
  intervalo_mediano_dias?: number | null;
  posts_30d?: number;
  posts_por_dia?: number | null;
  posts_por_semana?: number | null;
  n_com_data?: number;
  n_posts?: number;
  n_reels?: number;
  span_dias?: number | null;
  periodo_inicio?: string | null;
  periodo_fim?: string | null;
  fonte?: string;
  detalhe?: string;
  leitura?: string;
};

export type InstagramComparativoRow = {
  papel?: "cliente" | "concorrente" | string;
  nome?: string | null;
  dominio?: string | null;
  aparicoes?: number | null;
  handle?: string | null;
  url?: string | null;
  seguidores?: number | null;
  posts_total?: number | null;
  ritmo?: string | null;
  ultimo_dias?: number | null;
  intervalo_mediano_dias?: number | null;
  posts_por_semana?: number | null;
  posts_30d?: number | null;
  eng_proxy?: number | null;
  fonte_handle?: string | null;
  erro?: string | null;
};

export type InstagramMidiaItem = {
  code?: string | null;
  tipo?: string;
  caption?: string | null;
  thumbnail?: string | null;
  url?: string | null;
  likes?: number | null;
  plays?: number | null;
  comments?: number | null;
  papel?: "cliente" | "concorrente" | string;
  autor_nome?: string | null;
  autor_handle?: string | null;
  dominio?: string | null;
  intencao?: string | null;
  intencao_porque?: string | null;
};

export type InstagramData = {
  empresa?: string;
  fonte?: string;
  erro?: string | null;
  aviso?: string | null;
  atualizado_em?: string;
  resumo?: string;
  gap_vs_concorrentes?: string;
  prioridade?: string;
  angulos_para_copiar?: string[];
  angulos_do_cliente?: string[];
  pontos_fortes_concorrentes?: { concorrente?: string; ponto?: string; evidencia?: string }[];
  pontos_fracos_cliente?: { ponto?: string; evidencia?: string; como_melhorar?: string }[];
  grid_midia?: InstagramMidiaItem[];
  intencoes_resumo?: {
    cliente?: { intencao: string; n: number }[];
    concorrente?: { intencao: string; n: number }[];
  };
  comparativo_presenca?: {
    papel?: string;
    nome?: string | null;
    handle?: string | null;
    dominio?: string | null;
    seguidores?: number | null;
    ritmo?: string | null;
    posts_por_semana?: number | null;
    tem_whatsapp?: boolean;
    tem_site?: boolean;
    tem_hub?: boolean;
    links_resumo?: string;
    links?: {
      titulo?: string | null;
      url?: string;
      url_final?: string | null;
      destino?: string;
      label?: string;
    }[];
    intencoes_top?: { intencao: string; n: number }[];
    erro?: string | null;
  }[];
  link_site?: { handle?: string | null; url?: string | null; perfil?: string | null } | null;
  cliente?: {
    handle?: string | null;
    perfil?: InstagramPerfil | null;
    posts?: { code?: string; caption?: string | null; thumbnail?: string | null; url?: string | null; likes?: number | null; tipo?: string }[];
    reels?: { code?: string; caption?: string | null; thumbnail?: string | null; url?: string | null; likes?: number | null; plays?: number | null; tipo?: string }[];
    periodicidade?: InstagramPeriodicidade | null;
    engajamento?: { eng_proxy?: number | null; likes_mediana?: number | null } | null;
    links_bio?: {
      n?: number;
      tem_link?: boolean;
      tem_whatsapp?: boolean;
      tem_site?: boolean;
      tem_hub?: boolean;
      resumo?: string;
      email_bio?: string | null;
      telefone_bio?: string | null;
      links?: {
        titulo?: string | null;
        url?: string;
        url_final?: string | null;
        destino?: string;
        label?: string;
        host?: string | null;
        fonte?: string;
      }[];
    } | null;
    erro?: string | null;
  } | null;
  concorrentes?: {
    nome?: string;
    dominio?: string | null;
    handle?: string | null;
    fonte_handle?: string | null;
    queries_tentadas?: string[];
    match_score?: number | null;
    perfil?: InstagramPerfil | null;
    periodicidade?: InstagramPeriodicidade | null;
    erro?: string | null;
  }[];
  comparativo?: InstagramComparativoRow[];
  checklist?: { id: string; ok: boolean; label: string; detalhe: string; peso?: string }[];
  score?: { ok?: number; total?: number };
  nota_interna?: {
    nota?: number;
    faixa?: string;
    breakdown?: Record<string, number>;
    calculado_em?: string;
  };
  historico_notas?: { em?: string; nota?: number; faixa?: string }[];
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
  <div style={{ marginBottom: 4 }}>
    <h2 style={{ fontWeight: 700, fontSize: 15 }}>{children}</h2>
    {sub ? <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4, lineHeight: 1.45 }}>{sub}</p> : null}
  </div>
);

function fmtNum(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR");
}

function ritmoBadge(ritmo: string | null | undefined) {
  const r = (ritmo || "desconhecido").toLowerCase();
  const colors: Record<string, { bg: string; fg: string }> = {
    ativo: { bg: "rgba(21,128,61,0.12)", fg: "var(--fm-green)" },
    regular: { bg: "rgba(37,99,235,0.12)", fg: "#2563eb" },
    irregular: { bg: "rgba(217,119,6,0.12)", fg: "#d97706" },
    parado: { bg: "rgba(239,68,68,0.1)", fg: "var(--fm-red)" },
    desconhecido: { bg: "var(--fm-inset)", fg: "var(--fm-muted)" },
  };
  const c = colors[r] || colors.desconhecido;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
      background: c.bg, color: c.fg, textTransform: "capitalize",
    }}>
      {r}
    </span>
  );
}

export default function InstagramPanel({
  analiseId,
  initial,
}: {
  analiseId: string;
  initial: InstagramData | null | undefined;
}) {
  const router = useRouter();
  const [data, setData] = useState<InstagramData | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroMidia, setFiltroMidia] = useState<"todos" | "cliente" | "concorrente">("todos");

  async function atualizar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/conteudo/instagram/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analise_web_id: analiseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao atualizar Instagram");
      setData((json.instagram as InstagramData) ?? null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const nota = data?.nota_interna?.nota;
  const cliente = data?.cliente;
  const perfil = cliente?.perfil;
  const temAuditoria = !!data && (!!data.checklist?.length || data.nota_interna != null || !!data.erro);
  const comparativo = data?.comparativo ?? [];
  const gridMidia = (data?.grid_midia ?? []).filter((m) =>
    filtroMidia === "todos" ? true : m.papel === filtroMidia,
  );

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        <SectionTitle sub="Cliente vs concorrentes SERP: frequência, links da bio e intencionalidade dos posts/reels.">
          Instagram · vs SERP
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
          {loading ? "Atualizando…" : temAuditoria ? "Atualizar Instagram" : "Auditar Instagram"}
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
          Ainda sem auditoria. Clique em <b>Auditar Instagram</b> para achar o @ do cliente e dos concorrentes da SERP e comparar frequência.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {(data?.erro || data?.aviso) && (
            <p style={{ fontSize: 12, color: data.erro ? "var(--fm-red)" : "var(--fm-muted)" }}>
              {data.erro || data.aviso}
            </p>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            {perfil?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={perfil.avatar} alt="" width={48} height={48} style={{ borderRadius: "50%", objectFit: "cover" }} />
            ) : null}
            <div style={{ flex: 1, minWidth: 160 }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>
                {perfil?.url ? (
                  <a href={perfil.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                    @{perfil.username || cliente?.handle || "—"} ↗
                  </a>
                ) : (
                  <>@{perfil?.username || cliente?.handle || data?.link_site?.handle || "—"}</>
                )}
              </p>
              <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 2 }}>
                {perfil?.nome || "sem perfil"} · {fmtNum(perfil?.seguidores)} seguidores
                {cliente?.periodicidade?.detalhe ? ` · ${cliente.periodicidade.detalhe}` : ""}
              </p>
            </div>
            {nota != null && (
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{Math.round(nota)}</p>
                <p style={{ fontSize: 11, color: "var(--fm-muted)", textTransform: "capitalize" }}>{data?.nota_interna?.faixa}</p>
              </div>
            )}
          </div>

          {data?.resumo && (
            <p style={{ fontSize: 13, lineHeight: 1.55 }}>{data.resumo}</p>
          )}
          {data?.gap_vs_concorrentes && (
            <p style={{
              fontSize: 12, lineHeight: 1.5, padding: "8px 12px", borderRadius: 8,
              background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)", color: "#92400e",
            }}>
              Gap: {data.gap_vs_concorrentes}
            </p>
          )}

          {cliente?.links_bio && (
            <div>
              <Label>Links da bio · para onde vão</Label>
              {!cliente.links_bio.tem_link ? (
                <p style={{ fontSize: 12, color: "var(--fm-muted)" }}>Nenhum link na bio / external_url.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
                    {[
                      { ok: cliente.links_bio.tem_whatsapp, label: "WhatsApp" },
                      { ok: cliente.links_bio.tem_site, label: "Site" },
                      { ok: cliente.links_bio.tem_hub, label: "Hub (Linktree…)" },
                    ].map((b) => (
                      <span
                        key={b.label}
                        style={{
                          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                          background: b.ok ? "rgba(21,128,61,0.12)" : "var(--fm-inset)",
                          color: b.ok ? "var(--fm-green)" : "var(--fm-muted)",
                        }}
                      >
                        {b.ok ? "✓" : "✗"} {b.label}
                      </span>
                    ))}
                  </div>
                  {(cliente.links_bio.links || []).map((l, i) => (
                    <div
                      key={`${l.url}-${i}`}
                      style={{
                        display: "flex", gap: 10, alignItems: "flex-start",
                        padding: "8px 10px", borderRadius: 8, border: "1px solid var(--fm-border)",
                        background: "var(--fm-inset)", fontSize: 12,
                      }}
                    >
                      <span style={{
                        flexShrink: 0, fontWeight: 700, fontSize: 11, padding: "2px 7px", borderRadius: 6,
                        background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                      }}>
                        {l.label || l.destino}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        {l.titulo ? <p style={{ fontWeight: 600, marginBottom: 2 }}>{l.titulo}</p> : null}
                        <a
                          href={l.url_final || l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--fm-accent)", textDecoration: "none", wordBreak: "break-all" }}
                        >
                          {l.url}
                        </a>
                        {l.url_final && l.url_final !== l.url ? (
                          <p style={{ color: "var(--fm-muted)", marginTop: 2, fontSize: 11, wordBreak: "break-all" }}>
                            → {l.url_final}
                          </p>
                        ) : null}
                        <p style={{ color: "var(--fm-muted)", marginTop: 2, fontSize: 11 }}>
                          via {l.fonte}{l.host ? ` · ${l.host}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(cliente.links_bio.email_bio || cliente.links_bio.telefone_bio) && (
                    <p style={{ fontSize: 12, color: "var(--fm-muted)" }}>
                      {cliente.links_bio.telefone_bio ? `Tel bio: ${cliente.links_bio.telefone_bio}` : ""}
                      {cliente.links_bio.email_bio ? ` · E-mail bio: ${cliente.links_bio.email_bio}` : ""}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {comparativo.length > 0 && (
            <div>
              <Label>Comparativo · frequência</Label>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "var(--fm-muted)", borderBottom: "1px solid var(--fm-border)" }}>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>Quem</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>@</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>Seguidores</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>Ritmo</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>Último</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>Intervalo</th>
                      <th style={{ padding: "6px 8px", fontWeight: 600 }}>/sem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparativo.map((row, i) => (
                      <tr
                        key={`${row.handle || row.nome}-${i}`}
                        style={{
                          borderBottom: "1px solid var(--fm-border)",
                          background: row.papel === "cliente" ? "rgba(249,115,22,0.06)" : undefined,
                        }}
                      >
                        <td style={{ padding: "8px", fontWeight: row.papel === "cliente" ? 700 : 500 }}>
                          {row.papel === "cliente" ? "Cliente" : (row.nome || row.dominio || "—")}
                          {row.aparicoes != null ? (
                            <span style={{ color: "var(--fm-muted)", fontWeight: 400 }}> · SERP {row.aparicoes}</span>
                          ) : null}
                        </td>
                        <td style={{ padding: "8px" }}>
                          {row.handle ? (
                            <a
                              href={row.url || `https://www.instagram.com/${row.handle}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "var(--fm-accent)", textDecoration: "none" }}
                            >
                              @{row.handle}
                            </a>
                          ) : (
                            <span style={{ color: "var(--fm-muted)" }}>{row.erro || "sem @"}</span>
                          )}
                        </td>
                        <td style={{ padding: "8px" }}>{fmtNum(row.seguidores)}</td>
                        <td style={{ padding: "8px" }}>{ritmoBadge(row.ritmo)}</td>
                        <td style={{ padding: "8px" }}>{row.ultimo_dias != null ? `${row.ultimo_dias}d` : "—"}</td>
                        <td style={{ padding: "8px" }}>{row.intervalo_mediano_dias != null ? `${row.intervalo_mediano_dias}d` : "—"}</td>
                        <td style={{ padding: "8px" }}>{row.posts_por_semana != null ? row.posts_por_semana : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!!data?.checklist?.length && (
            <div>
              <Label>Checklist · {data.score?.ok}/{data.score?.total}</Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                {data.checklist.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: "8px 10px", borderRadius: 8, fontSize: 12,
                      border: "1px solid var(--fm-border)",
                      background: c.ok ? "rgba(21,128,61,0.06)" : "rgba(239,68,68,0.05)",
                    }}
                  >
                    <p style={{ fontWeight: 600 }}>{c.ok ? "✓" : "✗"} {c.label}</p>
                    <p style={{ color: "var(--fm-muted)", marginTop: 2, lineHeight: 1.4 }}>{c.detalhe}</p>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.melhorias_rapidas.map((m, i) => (
                  <div key={i} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--fm-border)", background: "var(--fm-inset)" }}>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{m.titulo}</p>
                    {m.porque ? <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4 }}>{m.porque}</p> : null}
                    {m.como ? <p style={{ fontSize: 12, marginTop: 4, lineHeight: 1.45 }}>{m.como}</p> : null}
                    <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 6 }}>
                      esforço {m.esforco || "—"} · impacto {m.impacto || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!data?.comparativo_presenca?.length && (
            <div>
              <Label>Comparativo de presença · mesmos pontos</Label>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "var(--fm-muted)", borderBottom: "1px solid var(--fm-border)" }}>
                      <th style={{ padding: "6px 8px" }}>Quem</th>
                      <th style={{ padding: "6px 8px" }}>Seguidores</th>
                      <th style={{ padding: "6px 8px" }}>Ritmo</th>
                      <th style={{ padding: "6px 8px" }}>/sem</th>
                      <th style={{ padding: "6px 8px" }}>WhatsApp</th>
                      <th style={{ padding: "6px 8px" }}>Site</th>
                      <th style={{ padding: "6px 8px" }}>Intenções top</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.comparativo_presenca.map((row, i) => (
                      <tr
                        key={`${row.handle || row.nome}-${i}`}
                        style={{
                          borderBottom: "1px solid var(--fm-border)",
                          background: row.papel === "cliente" ? "rgba(249,115,22,0.06)" : undefined,
                        }}
                      >
                        <td style={{ padding: "8px", fontWeight: row.papel === "cliente" ? 700 : 500 }}>
                          {row.papel === "cliente" ? "Cliente" : (row.nome || row.dominio || "—")}
                          {row.handle ? <span style={{ color: "var(--fm-muted)", fontWeight: 400 }}> · @{row.handle}</span> : null}
                          {row.papel === "concorrente" && data?.concorrentes?.find((c) => c.handle === row.handle)?.fonte_handle ? (
                            <span style={{ display: "block", fontSize: 10, color: "var(--fm-muted)", marginTop: 2 }}>
                              via {data.concorrentes.find((c) => c.handle === row.handle)?.fonte_handle}
                              {data.concorrentes.find((c) => c.handle === row.handle)?.queries_tentadas?.length
                                ? ` · ${data.concorrentes.find((c) => c.handle === row.handle)?.queries_tentadas?.slice(0, 3).join(" → ")}`
                                : ""}
                            </span>
                          ) : null}
                          {row.erro ? <span style={{ color: "var(--fm-red)", display: "block", fontSize: 11 }}>{row.erro}</span> : null}
                        </td>
                        <td style={{ padding: "8px" }}>{fmtNum(row.seguidores)}</td>
                        <td style={{ padding: "8px" }}>{ritmoBadge(row.ritmo)}</td>
                        <td style={{ padding: "8px" }}>{row.posts_por_semana ?? "—"}</td>
                        <td style={{ padding: "8px", fontWeight: 700, color: row.tem_whatsapp ? "var(--fm-green)" : "var(--fm-red)" }}>
                          {row.tem_whatsapp ? "✓" : "✗"}
                        </td>
                        <td style={{ padding: "8px", fontWeight: 700, color: row.tem_site || row.tem_hub ? "var(--fm-green)" : "var(--fm-red)" }}>
                          {row.tem_site ? "✓ site" : row.tem_hub ? "hub" : "✗"}
                        </td>
                        <td style={{ padding: "8px", fontSize: 11, color: "var(--fm-muted)" }}>
                          {(row.intencoes_top || []).slice(0, 3).map((x) => `${x.intencao}(${x.n})`).join(" · ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10, marginTop: 12 }}>
                {data.comparativo_presenca.filter((r) => r.papel === "concorrente" && (r.links?.length || r.links_resumo)).map((row, i) => (
                  <div key={`links-${row.handle}-${i}`} style={{
                    padding: "10px 12px", borderRadius: 8, border: "1px solid var(--fm-border)", background: "var(--fm-inset)", fontSize: 12,
                  }}>
                    <p style={{ fontWeight: 700, marginBottom: 6 }}>@{row.handle || "—"} · links bio</p>
                    {(row.links || []).length ? (row.links || []).map((l, j) => (
                      <p key={j} style={{ marginBottom: 4, lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 600 }}>{l.label}</span>
                        {l.titulo ? ` · ${l.titulo}` : ""}
                        <br />
                        <a href={l.url_final || l.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--fm-accent)", wordBreak: "break-all", textDecoration: "none" }}>
                          {l.url}
                        </a>
                      </p>
                    )) : (
                      <p style={{ color: "var(--fm-muted)" }}>{row.links_resumo || "sem links"}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!(data?.pontos_fortes_concorrentes?.length || data?.pontos_fracos_cliente?.length) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
              {!!data?.pontos_fortes_concorrentes?.length && (
                <div>
                  <Label>Pontos fortes dos concorrentes</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {data.pontos_fortes_concorrentes.map((p, i) => (
                      <div key={i} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--fm-border)", background: "rgba(21,128,61,0.06)", fontSize: 12 }}>
                        <p style={{ fontWeight: 700 }}>{p.concorrente || "Concorrente"} · {p.ponto}</p>
                        {p.evidencia ? <p style={{ color: "var(--fm-muted)", marginTop: 4 }}>{p.evidencia}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!!data?.pontos_fracos_cliente?.length && (
                <div>
                  <Label>Nossos fracos · como melhorar</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {data.pontos_fracos_cliente.map((p, i) => (
                      <div key={i} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--fm-border)", background: "rgba(239,68,68,0.05)", fontSize: 12 }}>
                        <p style={{ fontWeight: 700 }}>{p.ponto}</p>
                        {p.evidencia ? <p style={{ color: "var(--fm-muted)", marginTop: 4 }}>{p.evidencia}</p> : null}
                        {p.como_melhorar ? <p style={{ marginTop: 6, lineHeight: 1.45 }}>{p.como_melhorar}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!!(data?.angulos_para_copiar?.length || data?.angulos_do_cliente?.length || data?.intencoes_resumo) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {!!data?.angulos_do_cliente?.length && (
                <div>
                  <Label>Ângulos do cliente</Label>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.5 }}>
                    {data.angulos_do_cliente.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}
              {!!data?.angulos_para_copiar?.length && (
                <div>
                  <Label>Ângulos para testar (dos concorrentes)</Label>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.5 }}>
                    {data.angulos_para_copiar.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}
              {data?.intencoes_resumo && (
                <div>
                  <Label>Mix de intenções</Label>
                  <p style={{ fontSize: 12, color: "var(--fm-muted)", marginBottom: 4 }}>Cliente</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {(data.intencoes_resumo.cliente || []).slice(0, 5).map((x) => (
                      <span key={`c-${x.intencao}`} style={chipStyle}>{x.intencao} · {x.n}</span>
                    ))}
                    {!data.intencoes_resumo.cliente?.length && <span style={{ fontSize: 12, color: "var(--fm-muted)" }}>—</span>}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--fm-muted)", marginBottom: 4 }}>Concorrentes</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(data.intencoes_resumo.concorrente || []).slice(0, 6).map((x) => (
                      <span key={`k-${x.intencao}`} style={chipStyle}>{x.intencao} · {x.n}</span>
                    ))}
                    {!data.intencoes_resumo.concorrente?.length && <span style={{ fontSize: 12, color: "var(--fm-muted)" }}>—</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {!!(data?.grid_midia?.length) && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <Label>Feed recente · intencionalidade ({gridMidia.length})</Label>
                <div style={{ display: "flex", gap: 4 }}>
                  {([
                    ["todos", "Todos"],
                    ["cliente", "Cliente"],
                    ["concorrente", "Concorrentes"],
                  ] as const).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFiltroMidia(id)}
                      style={{
                        fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                        border: "1px solid var(--fm-border)",
                        background: filtroMidia === id ? "var(--fm-accent)" : "var(--fm-surface)",
                        color: filtroMidia === id ? "#fff" : "var(--fm-muted)",
                        cursor: "pointer",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 10,
              }}>
                {gridMidia.map((m, i) => (
                  <article
                    key={`${m.code || i}-${m.autor_handle}`}
                    style={{
                      border: "1px solid var(--fm-border)", borderRadius: 10, overflow: "hidden",
                      background: "var(--fm-surface)", display: "flex", flexDirection: "column",
                    }}
                  >
                    <a href={m.url || "#"} target="_blank" rel="noopener noreferrer" style={{ display: "block", aspectRatio: "1", position: "relative", background: "var(--fm-inset)" }}>
                      {m.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ padding: 12, fontSize: 11, color: "var(--fm-muted)" }}>{m.caption?.slice(0, 80) || "sem preview"}</div>
                      )}
                      <span style={{
                        position: "absolute", top: 8, left: 8, fontSize: 10, fontWeight: 700,
                        background: m.papel === "cliente" ? "rgba(249,115,22,0.9)" : "rgba(28,37,51,0.75)",
                        color: "#fff", padding: "2px 7px", borderRadius: 6,
                      }}>
                        {m.papel === "cliente" ? "Cliente" : (m.autor_handle ? `@${m.autor_handle}` : "Concorrente")}
                      </span>
                      {m.tipo === "reel" && (
                        <span style={{
                          position: "absolute", top: 8, right: 8, fontSize: 10, fontWeight: 700,
                          background: "rgba(0,0,0,0.65)", color: "#fff", padding: "2px 6px", borderRadius: 4,
                        }}>
                          Reel
                        </span>
                      )}
                    </a>
                    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                      {m.intencao && (
                        <span style={{
                          alignSelf: "flex-start", fontSize: 10, fontWeight: 700,
                          padding: "3px 8px", borderRadius: 20,
                          background: "rgba(37,99,235,0.12)", color: "#2563eb",
                        }}>
                          {m.intencao}
                        </span>
                      )}
                      {m.caption && (
                        <p style={{ fontSize: 12, color: "var(--fm-muted)", lineHeight: 1.45, flex: 1 }}>
                          {m.caption.length > 140 ? `${m.caption.slice(0, 140)}…` : m.caption}
                        </p>
                      )}
                      {m.intencao_porque && (
                        <p style={{ fontSize: 11, color: "var(--fm-text)", lineHeight: 1.4 }}>{m.intencao_porque}</p>
                      )}
                      <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
                        {m.likes != null ? `${fmtNum(m.likes)} likes` : ""}
                        {m.plays != null ? `${m.likes != null ? " · " : ""}${fmtNum(m.plays)} plays` : ""}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {!!(cliente?.posts?.length || cliente?.reels?.length) && !data?.grid_midia?.length && (
            <div>
              <Label>
                Mídia recente do cliente
                {cliente.periodicidade?.n_posts != null || cliente.periodicidade?.n_reels != null
                  ? ` · ${cliente.periodicidade?.n_posts ?? 0} posts + ${cliente.periodicidade?.n_reels ?? 0} reels`
                  : ""}
              </Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                {[...(cliente.reels || []), ...(cliente.posts || [])].slice(0, 12).map((p, i) => (
                  <a
                    key={p.code || i}
                    href={p.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block", aspectRatio: "1", borderRadius: 8, overflow: "hidden",
                      border: "1px solid var(--fm-border)", background: "var(--fm-surface)", position: "relative",
                    }}
                  >
                    {p.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ padding: 8, fontSize: 10, color: "var(--fm-muted)" }}>{p.caption?.slice(0, 40) || "post"}</div>
                    )}
                    {p.tipo === "reel" && (
                      <span style={{
                        position: "absolute", top: 6, left: 6, fontSize: 10, fontWeight: 700,
                        background: "rgba(0,0,0,0.65)", color: "#fff", padding: "1px 6px", borderRadius: 4,
                      }}>
                        Reel
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {data?.custo && (
            <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
              {data.custo.consultas ?? 0} consulta(s) RapidAPI
              {data.custo.custo_usd != null ? ` · ~US$ ${Number(data.custo.custo_usd).toFixed(4)}` : ""}
              {data.atualizado_em ? ` · ${new Date(data.atualizado_em).toLocaleString("pt-BR")}` : ""}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

const chipStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  padding: "2px 8px",
  borderRadius: 20,
  background: "var(--fm-inset)",
  border: "1px solid var(--fm-border)",
  color: "var(--fm-text)",
};
