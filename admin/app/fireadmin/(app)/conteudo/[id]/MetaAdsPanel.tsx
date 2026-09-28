"use client";

import EspecialistaBloco from "./EspecialistaBloco";
import type { EspecialistaBloco as EspecialistaData } from "@/lib/especialista";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Card } from "@/components/AdminForm";

export type MetaAdItem = {
  id?: string;
  plataforma?: string;
  origem?: "cliente" | "concorrente" | string;
  anunciante?: string;
  concorrente_nome?: string;
  page_name?: string;
  page_avatar?: string | null;
  texto?: string | null;
  titulo?: string | null;
  cta?: string | null;
  cta_type?: string | null;
  link_url?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  intencao?: string | null;
  intencao_porque?: string | null;
  plataformas?: string[];
  inicio?: string;
  fim?: string | null;
  snapshot_url?: string;
  ativo?: boolean;
  display_format?: string;
};

export type MetaAdsData = {
  empresa?: string;
  fonte?: string;
  facebook?: { url?: string; perfil?: string; page_id?: string | null } | null;
  library_url?: string;
  library_urls?: { meta?: string; tiktok?: string; google?: string };
  ads_cliente?: MetaAdItem[];
  ads_concorrentes?: MetaAdItem[];
  ads_grid?: MetaAdItem[];
  ads_por_plataforma?: {
    meta?: MetaAdItem[];
    tiktok?: MetaAdItem[];
    google?: MetaAdItem[];
  };
  totais_plataforma?: { meta?: number; tiktok?: number; google?: number };
  ads_cliente_count?: number;
  ads_ativos?: number;
  concorrentes?: {
    nome?: string;
    qtd?: number;
    erro?: string | null;
    ads?: MetaAdItem[];
  }[];
  concorrentes_consultados?: string[];
  ads_concorrentes_count?: number;
  erro?: string | null;
  aviso?: string | null;
  checklist?: { id: string; ok: boolean; label: string; detalhe: string; peso?: string }[];
  score?: { ok?: number; total?: number };
  nota_interna?: {
    nota?: number;
    faixa?: string;
    breakdown?: Record<string, number>;
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
  angulos_observados?: string[];
  atualizado_em?: string;
  custo?: {
    provedor?: string | null;
    consultas?: number;
    custo_usd?: number;
    preco_por_consulta?: number;
    plano?: string | null;
    ref?: string;
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

function txt(value: unknown, fallback = "—"): string {
  if (value == null || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function AdPostCard({ ad }: { ad: MetaAdItem }) {
  const isConc = ad.origem === "concorrente";
  const media = ad.image_url || ad.video_url;
  const copy = ad.texto || ad.titulo;

  return (
    <article style={{
      display: "flex", flexDirection: "column",
      background: "var(--fm-inset)", borderRadius: 12,
      border: `1px solid ${isConc ? "var(--fm-border)" : "var(--fm-border)"}`,
      overflow: "hidden", minHeight: 0,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 12px", borderBottom: "1px solid var(--fm-border)",
      }}>
        {ad.page_avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ad.page_avatar} alt="" width={28} height={28}
            style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: "var(--fm-overlay)",
            display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700,
            color: "var(--fm-muted)", flexShrink: 0,
          }}>
            {(ad.page_name || ad.anunciante || "?").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {txt(ad.page_name || ad.anunciante)}
          </p>
          <p style={{ fontSize: 10, color: "var(--fm-muted)", marginTop: 1 }}>
            {ad.plataforma || "ad"}
            {isConc ? ` · concorrente` : " · cliente"}
            {ad.ativo === false ? " · inativo" : ""}
          </p>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
          padding: "2px 7px", borderRadius: 20, flexShrink: 0,
          background: isConc ? "rgba(161,98,7,0.12)" : "rgba(21,128,61,0.12)",
          color: isConc ? "#eab308" : "var(--fm-green)",
        }}>
          {isConc ? "riv" : "cli"}
        </span>
      </div>

      <div style={{
        aspectRatio: "1 / 1", background: "var(--fm-inset)",
        display: "grid", placeItems: "center", position: "relative",
      }}>
        {ad.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ad.image_url}
            alt={txt(ad.titulo, "criativo")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : media && ad.video_url && !ad.image_url ? (
          <video
            src={ad.video_url}
            muted
            playsInline
            controls
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <p style={{ fontSize: 11, color: "var(--fm-muted)", padding: 16, textAlign: "center" }}>
            Sem preview de criativo
            {ad.snapshot_url ? (
              <>
                <br />
                <a href={ad.snapshot_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--fm-accent)" }}>abrir na library</a>
              </>
            ) : null}
          </p>
        )}
        {ad.plataforma && (
          <span style={{
            position: "absolute", top: 8, left: 8,
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            background: "rgba(28,37,51,0.72)", color: "#fff", padding: "2px 7px", borderRadius: 6,
          }}>
            {ad.plataforma}
          </span>
        )}
      </div>

      <div style={{ padding: "12px 12px 14px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {ad.intencao && (
          <span style={{
            alignSelf: "flex-start", fontSize: 10, fontWeight: 700,
            padding: "3px 8px", borderRadius: 20,
            background: "rgba(37,99,235,0.12)", color: "var(--fm-blue)",
          }}>
            {ad.intencao}
          </span>
        )}
        {ad.titulo && (
          <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.35 }}>
            {ad.titulo.length > 90 ? `${ad.titulo.slice(0, 90)}…` : ad.titulo}
          </p>
        )}
        {copy && (
          <p style={{ fontSize: 12, color: "var(--fm-muted)", lineHeight: 1.45, flex: 1 }}>
            {copy.length > 180 ? `${copy.slice(0, 180)}…` : copy}
          </p>
        )}
        {ad.cta && (
          <p style={{
            fontSize: 11, fontWeight: 700, marginTop: "auto",
            padding: "8px 10px", textAlign: "center", borderRadius: 8,
            background: "var(--fm-overlay)", border: "1px solid var(--fm-border)",
          }}>
            {ad.cta}
          </p>
        )}
        {ad.snapshot_url && (
          <a href={ad.snapshot_url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: "var(--fm-accent)", textDecoration: "none", fontWeight: 600 }}>
            Ver original ↗
          </a>
        )}
      </div>
    </article>
  );
}

export default function MetaAdsPanel({
  analiseId,
  initial,
}: {
  analiseId: string;
  initial: MetaAdsData | null | undefined;
}) {
  const router = useRouter();
  const [data, setData] = useState<MetaAdsData | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todos" | "cliente" | "concorrente">("todos");

  async function atualizar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/conteudo/meta-ads/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analise_web_id: analiseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao atualizar Meta Ads");
      setData((json.meta_ads as MetaAdsData) ?? null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const nota = data?.nota_interna?.nota;
  const temAuditoria = !!data && (!!data.checklist?.length || data.nota_interna != null || !!data.erro);

  const grid = useMemo(() => {
    const base = data?.ads_grid?.length
      ? data.ads_grid
      : [...(data?.ads_cliente || []), ...(data?.ads_concorrentes || [])];
    if (filtro === "todos") return base;
    return base.filter((a) => a.origem === filtro);
  }, [data, filtro]);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        <SectionTitle sub="Cliente + concorrentes (RapidAPI). Grid com criativo, copy e intenção do anúncio.">
          Ads (Meta · TikTok · Google)
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
          {loading ? "Atualizando…" : temAuditoria ? "Atualizar Ads" : "Auditar Ads"}
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
          Ainda sem auditoria de ads. Clique em <b>Auditar Ads</b> (precisa de <code>RAPIDAPI_KEY</code>).
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {nota != null && (
              <span style={{
                fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums",
                color: notaColor(nota), letterSpacing: "-0.02em",
              }}>
                {nota}
                <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 6, color: "var(--fm-muted)" }}>
                  nota · {data.nota_interna?.faixa}
                </span>
              </span>
            )}
            <span style={{ fontSize: 12, color: "var(--fm-muted)", fontVariantNumeric: "tabular-nums" }}>
              {data.ads_cliente_count ?? 0} cliente · {data.ads_concorrentes_count ?? 0} concorrentes
            </span>
            {!!data.concorrentes_consultados?.length && (
              <span style={{ fontSize: 11, color: "var(--fm-muted)" }}>
                buscados: {data.concorrentes_consultados.join(", ")}
              </span>
            )}
            {data.custo && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                background: "var(--fm-hover)", color: "var(--fm-muted)", fontVariantNumeric: "tabular-nums",
              }}>
                {data.custo.consultas ?? 0} consultas · US$ {(data.custo.custo_usd ?? 0).toFixed(4)}
              </span>
            )}
          </div>

          {data.resumo && <p style={{ fontSize: 13, lineHeight: 1.55 }}>{txt(data.resumo, "")}</p>}
          {data.erro && <p style={{ fontSize: 12, color: "var(--fm-red)" }}>{txt(data.erro, "")}</p>}

          {!!data.checklist?.length && (
            <div>
              <Label>Checklist Ads</Label>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 8, marginTop: 8,
              }}>
                {data.checklist.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: "10px 12px", background: "var(--fm-inset)", borderRadius: 10,
                      border: "1px solid var(--fm-border)", minHeight: 72,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{
                        color: c.ok ? "var(--fm-green)" : "var(--fm-red)",
                        fontWeight: 800, fontSize: 13,
                      }}>
                        {c.ok ? "✓" : "✕"}
                      </span>
                      <p style={{ fontWeight: 700, fontSize: 12 }}>{txt(c.label)}</p>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--fm-muted)", lineHeight: 1.35 }}>
                      {txt(c.detalhe, "")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <Label>Feed de anúncios ({grid.length})</Label>
              <div style={{ display: "flex", gap: 6 }}>
                {([
                  ["todos", "Todos"],
                  ["cliente", "Cliente"],
                  ["concorrente", "Concorrentes"],
                ] as const).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFiltro(k)}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 20,
                      border: "1px solid var(--fm-border)",
                      background: filtro === k ? "var(--fm-accent)" : "var(--fm-hover)",
                      color: filtro === k ? "#fff" : "var(--fm-muted)",
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {!grid.length ? (
              <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>
                Nenhum anúncio na grid. Se os concorrentes não apareceram, confira se a análise tem concorrentes salvos e rode Auditar Ads de novo.
              </p>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 12,
              }}>
                {grid.map((ad, i) => (
                  <AdPostCard key={`${ad.plataforma}-${ad.id || i}-${ad.origem}`} ad={ad} />
                ))}
              </div>
            )}
          </div>

          {!!data?.especialista && (
            <EspecialistaBloco data={data.especialista} />
          )}

          {!!data.melhorias_rapidas?.length && (
            <div>
              <Label>Melhorias rápidas</Label>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 8, marginTop: 8,
              }}>
                {data.melhorias_rapidas.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 14px", background: "var(--fm-inset)", borderRadius: 8,
                      border: "1px solid var(--fm-border)",
                    }}
                  >
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{i + 1}. {txt(m.titulo)}</p>
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
