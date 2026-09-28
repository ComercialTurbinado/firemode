"use client";

import { TermoLabel } from "./TermoHint";
import { fetchConteudoJson } from "@/lib/fetch-conteudo-json";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/AdminForm";

export type PosicionamentoData = {
  atualizado_em?: string;
  erro?: string | null;
  fonte?: string | null;
  resumo?: string | null;
  cliente?: {
    empresa?: string | null;
    instagram_handle?: string | null;
    instagram_bio?: string | null;
    site_title?: string | null;
    site_description?: string | null;
    angulo?: string | null;
    leitura?: string | null;
    bio_diagnostico?: string | null;
    headline_diagnostico?: string | null;
    cta_diagnostico?: string | null;
    ads?: { titulo?: string | null; texto?: string | null; cta?: string | null }[];
  };
  concorrentes?: {
    nome?: string;
    dominio?: string | null;
    angulo?: string | null;
    instagram_bio?: string | null;
    diferenca_vs_cliente?: string | null;
    forca_copy?: string | null;
    fraqueza_copy?: string | null;
    fonte?: string[];
  }[];
  matriz?: {
    promessas?: string[];
    ctas_dominantes?: string[];
    gap_cliente?: string | null;
    oportunidade?: string | null;
  };
  recomendacoes?: {
    bio_instagram?: { atual?: string | null; sugerida?: string | null; porque?: string | null };
    headline_site?: { atual?: string | null; sugerida?: string | null; porque?: string | null };
    cta_principal?: { atual?: string | null; sugerida?: string | null; porque?: string | null };
  };
  melhorias_rapidas?: {
    titulo: string;
    porque?: string;
    como?: string;
    sugerida?: string;
    atual?: string;
    onde?: string;
    esforco?: string;
    impacto?: string;
  }[];
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontWeight: 600, fontSize: 11, color: "var(--fm-muted)",
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
  }}>
    {children}
  </p>
);

const box: React.CSSProperties = {
  padding: "12px 14px",
  background: "var(--fm-inset)",
  borderRadius: 8,
  border: "1px solid var(--fm-border)",
};

export default function PosicionamentoPanel({
  analiseId,
  initial,
}: {
  analiseId: string;
  initial: PosicionamentoData | null | undefined;
}) {
  const router = useRouter();
  const [data, setData] = useState<PosicionamentoData | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function atualizar() {
    setLoading(true);
    setErro(null);
    try {
      const json = await fetchConteudoJson<{ posicionamento?: PosicionamentoData }>(
        "/api/conteudo/posicionamento/atualizar",
        {
          method: "POST",
          body: JSON.stringify({ analise_web_id: analiseId }),
        },
      );
      setData(json.posicionamento ?? null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const tem = !!data && (!!data.resumo || !!data.recomendacoes || !!data.erro);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 14 }}>
            <TermoLabel glossKey="posicionamento">Posicionamento</TermoLabel>
            {" · bio, headlines e CTAs"}
          </h2>
          <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 4 }}>
            Cliente × rivais: o que a bio, o title do site e os CTAs prometem — e como melhorar pra ficar na frente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void atualizar()}
          disabled={loading}
          style={{
            flexShrink: 0, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: loading ? "var(--fm-overlay)" : "var(--fm-accent)",
            color: loading ? "var(--fm-muted)" : "#fff",
            border: "none", cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Analisando…" : tem ? "Atualizar posicionamento" : "Auditar posicionamento"}
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
        <p style={{ color: "var(--fm-muted)", fontSize: 13, lineHeight: 1.55 }}>
          Ideal depois de Tech SEO, Instagram e sincronizar concorrentes (IA/Ads). Gera bio, headline e CTA sugeridos.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data.erro && (
            <p style={{ fontSize: 12, color: "var(--fm-yellow)" }}>{data.erro}</p>
          )}
          {data.resumo && (
            <p style={{ fontSize: 14, lineHeight: 1.55, fontWeight: 550 }}>{data.resumo}</p>
          )}

          {data.cliente && (
            <div style={box}>
              <Label>Cliente · ângulo {data.cliente.angulo || "—"}</Label>
              {data.cliente.leitura && (
                <p style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>{data.cliente.leitura}</p>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)", fontWeight: 700 }}>Bio IG</p>
                  <p style={{ fontSize: 12, marginTop: 4, lineHeight: 1.45 }}>
                    {data.cliente.instagram_bio || "—"}
                  </p>
                  {data.cliente.bio_diagnostico && (
                    <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 6 }}>{data.cliente.bio_diagnostico}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)", fontWeight: 700 }}>Headline site</p>
                  <p style={{ fontSize: 12, marginTop: 4, lineHeight: 1.45 }}>
                    {data.cliente.site_title || "—"}
                  </p>
                  {data.cliente.headline_diagnostico && (
                    <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 6 }}>{data.cliente.headline_diagnostico}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)", fontWeight: 700 }}>CTA / ads</p>
                  <p style={{ fontSize: 12, marginTop: 4, lineHeight: 1.45 }}>
                    {data.cliente.ads?.[0]?.cta || data.cliente.ads?.[0]?.titulo || "—"}
                  </p>
                  {data.cliente.cta_diagnostico && (
                    <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 6 }}>{data.cliente.cta_diagnostico}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!!data.concorrentes?.length && (
            <div>
              <Label>Rivais · copy</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.concorrentes.map((c, i) => (
                  <div key={i} style={box}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{c.nome}</p>
                      {c.angulo && (
                        <span style={{ fontSize: 11, color: "var(--fm-muted)" }}>ângulo: {c.angulo}</span>
                      )}
                    </div>
                    {c.instagram_bio && (
                      <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 6, lineHeight: 1.45 }}>
                        Bio: {c.instagram_bio}
                      </p>
                    )}
                    {c.diferenca_vs_cliente && (
                      <p style={{ fontSize: 13, marginTop: 6, lineHeight: 1.45 }}>{c.diferenca_vs_cliente}</p>
                    )}
                    {(c.forca_copy || c.fraqueza_copy) && (
                      <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 6 }}>
                        {c.forca_copy ? `Força: ${c.forca_copy}` : ""}
                        {c.forca_copy && c.fraqueza_copy ? " · " : ""}
                        {c.fraqueza_copy ? `Fraqueza: ${c.fraqueza_copy}` : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.matriz && (data.matriz.gap_cliente || data.matriz.oportunidade) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={box}>
                <Label>Gap do cliente</Label>
                <p style={{ fontSize: 13, lineHeight: 1.5 }}>{data.matriz.gap_cliente || "—"}</p>
              </div>
              <div style={box}>
                <Label>Oportunidade</Label>
                <p style={{ fontSize: 13, lineHeight: 1.5 }}>{data.matriz.oportunidade || "—"}</p>
              </div>
            </div>
          )}

          {data.recomendacoes && (
            <div>
              <Label>Copy sugerida</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(["bio_instagram", "headline_site", "cta_principal"] as const).map((key) => {
                  const r = data.recomendacoes?.[key];
                  if (!r?.sugerida) return null;
                  const titulo = key === "bio_instagram" ? "Bio Instagram" : key === "headline_site" ? "Headline / title" : "CTA principal";
                  return (
                    <div key={key} style={box}>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{titulo}</p>
                      {r.atual && (
                        <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 6, textDecoration: "line-through" }}>
                          {r.atual}
                        </p>
                      )}
                      <p style={{ fontSize: 14, marginTop: 6, lineHeight: 1.5, fontWeight: 550 }}>{r.sugerida}</p>
                      {r.porque && (
                        <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 6 }}>{r.porque}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!!data.melhorias_rapidas?.length && (
            <div>
              <Label>Melhorias</Label>
              {data.melhorias_rapidas.map((m, i) => (
                <div key={i} style={{ ...box, marginBottom: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: 13 }}>{i + 1}. {m.titulo}</p>
                  {m.como && <p style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{m.como}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
