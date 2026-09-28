"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/AdminForm";
import { asDisplayText } from "@/lib/text-field";

export type GapPercepcao = {
  gap?: string;
  evidencia?: string;
  risco_ou_oportunidade?: string;
  severidade?: string;
};

export type PercepcaoValorData = {
  produto_declarado?: string | null;
  produto_percebido?: string | null;
  proposta_valor_declarada?: string | null;
  proposta_valor_percebida?: string | null;
  percepcao_real_marca?: string | null;
  tom_visual_e_verbal?: string | null;
  percepcao_em_ia?: string | null;
  ia_cita_marca?: string | null;
  gaps?: GapPercepcao[];
  o_que_reforcar?: string[];
  o_que_corrigir?: string[];
  pitch_agencia?: string | null;
  confianca?: string | null;
  aviso?: string | null;
  gerado_em?: string;
  atualizado_em?: string;
  amostra?: {
    ig_videos?: number;
    yt_videos?: number;
    imagens?: number;
    handle_instagram?: string | null;
    whisper_ok?: number;
    n8n_ok?: number;
    transcript_yt_ok?: number;
    vision_ok?: number;
    ig_vinculados?: number;
    yt_vinculados?: number;
    tem_ai_visibility?: boolean;
  };
  evidencias?: {
    instagram_videos?: {
      code?: string;
      url?: string;
      caption?: string;
      transcricao?: string | null;
      metodo_audio?: string | null;
      erro_audio?: string | null;
      thumbnail?: string | null;
      classificacao?: {
        tipo?: string;
        tom?: string;
        gancho_original?: string;
        tema_central?: string;
      } | null;
    }[];
    youtube_videos?: {
      id?: string;
      titulo?: string;
      url?: string;
      transcricao?: string | null;
      metodo_audio?: string | null;
      erro_audio?: string | null;
      classificacao?: {
        tipo?: string;
        tom?: string;
        gancho_original?: string;
        tema_central?: string;
      } | null;
    }[];
    imagens?: {
      ref?: string;
      plataforma?: string;
      thumbnail?: string;
      leitura?: string;
      vende_o_que?: string;
      tom?: string;
      cta?: string;
      estetica?: string;
      texto_na_imagem?: string;
    }[];
    visibilidade_ia?: {
      nota?: number;
      faixa?: string;
      resumo?: string | null;
      prompts?: { prompt?: string; citado?: boolean; trecho?: string | null }[];
      llms_txt_ok?: boolean;
      bots_ok?: boolean;
    } | null;
  };
  sintese?: Record<string, unknown>;
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

function confColor(c?: string | null) {
  if (c === "alta") return "var(--fm-green)";
  if (c === "baixa") return "var(--fm-red)";
  return "var(--fm-yellow)";
}

export default function PercepcaoPanel({
  analiseId,
  initial,
  aiVisibility,
}: {
  analiseId: string;
  initial: PercepcaoValorData | null | undefined;
  /** Snapshot opcional de Visibilidade em IA (mesmo sem reauditar percepção). */
  aiVisibility?: {
    nota_interna?: { nota?: number; faixa?: string } | null;
    resumo?: string | null;
    prompts?: { prompt?: string; engines?: { citado?: boolean; trecho?: string | null }[] }[];
    ai_prep?: { llms_txt?: { ok?: boolean }; bots_ok?: boolean };
  } | null;
}) {
  const router = useRouter();
  const [data, setData] = useState<PercepcaoValorData | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function auditar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/conteudo/percepcao-valor/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analise_web_id: analiseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha na auditoria de percepção");
      setData((json.percepcao_valor as PercepcaoValorData) ?? null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao auditar percepção");
    } finally {
      setLoading(false);
    }
  }

  const atualizado = fmtData(data?.atualizado_em || data?.gerado_em);
  const amostra = data?.amostra;
  const gaps = data?.gaps ?? [];
  const igVids = data?.evidencias?.instagram_videos ?? [];
  const ytVids = data?.evidencias?.youtube_videos ?? [];
  const imgs = data?.evidencias?.imagens ?? [];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 14 }}>Percepção de valor</h2>
          <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 4 }}>
            Produto declarado × feed × o que a IA responde · Whisper + visão + Visibilidade em IA
          </p>
          {atualizado ? (
            <p style={{ color: "var(--fm-muted)", fontSize: 11, marginTop: 4 }}>
              Gerado {atualizado}
              {amostra ? (
                <> · {amostra.ig_videos ?? 0} IG · {amostra.yt_videos ?? 0} YT · {amostra.imagens ?? 0} imgs
                  {amostra.whisper_ok ? ` · whisper ${amostra.whisper_ok}` : ""}
                  {amostra.n8n_ok ? ` · n8n ${amostra.n8n_ok}` : ""}
                  {amostra.vision_ok ? ` · vision ${amostra.vision_ok}` : ""}
                  {(amostra.ig_vinculados || amostra.yt_vinculados) ? (
                    <> · vinculados à midia: {amostra.ig_vinculados ?? 0} IG · {amostra.yt_vinculados ?? 0} YT</>
                  ) : null}
                </>
              ) : null}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={auditar}
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
          {loading ? "Analisando mídia…" : data ? "Reauditar percepção" : "Auditar percepção"}
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--fm-muted)", fontSize: 13, marginBottom: 12 }}>
          Pode levar 1–3 min (n8n + vision). As transcrições vão para a midia do IG/YT pra não refazer.
        </p>
      ) : null}

      {erro ? (
        <p style={{ color: "var(--fm-red)", fontSize: 13, marginBottom: 14 }}>{erro}</p>
      ) : null}

      {!data ? (
        <p style={{ color: "var(--fm-muted)", fontSize: 13, lineHeight: 1.55 }}>
          Botão separado do diagnóstico geral. Amostra magra: até 5 Reels + 3 YT + 8 imagens.
          Ideal depois de IG/YT e <b>Auditar IA</b> — a síntese cruza site × feed × LLM.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {data.aviso ? (
            <p style={{ fontSize: 12, color: "var(--fm-yellow)" }}>{data.aviso}</p>
          ) : null}

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--fm-muted)" }}>Confiança</span>
            <span style={{
              fontSize: 12, fontWeight: 700, color: confColor(data.confianca),
              textTransform: "uppercase", letterSpacing: "0.04em",
            }}>
              {data.confianca || "—"}
            </span>
          </div>

          {/* Declarado × percebido */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
            className="perc-grid2"
          >
            <div style={boxStyle}>
              <Label>Produto declarado (site)</Label>
              <p style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 550 }}>
                {data.produto_declarado || "—"}
              </p>
              {data.proposta_valor_declarada ? (
                <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 8, lineHeight: 1.45 }}>
                  {data.proposta_valor_declarada}
                </p>
              ) : null}
            </div>
            <div style={boxStyle}>
              <Label>Produto percebido (feed)</Label>
              <p style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 550 }}>
                {data.produto_percebido || "—"}
              </p>
              {data.proposta_valor_percebida ? (
                <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 8, lineHeight: 1.45 }}>
                  {data.proposta_valor_percebida}
                </p>
              ) : null}
            </div>
          </div>

          {data.percepcao_real_marca ? (
            <div style={{
              padding: "12px 14px",
              background: "var(--fm-inset)",
              borderRadius: 10,
              border: "1px solid var(--fm-border)",
            }}>
              <Label>Percepção real da marca</Label>
              <p style={{ fontSize: 14, lineHeight: 1.55 }}>{data.percepcao_real_marca}</p>
              {asDisplayText(data.tom_visual_e_verbal) ? (
                <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 8, whiteSpace: "pre-wrap" }}>
                  Tom: {asDisplayText(data.tom_visual_e_verbal)}
                </p>
              ) : null}
            </div>
          ) : null}

          {(data.percepcao_em_ia
            || data.ia_cita_marca
            || data.evidencias?.visibilidade_ia
            || aiVisibility?.resumo
            || (aiVisibility?.prompts?.length ?? 0) > 0) ? (
            <div style={{
              padding: "12px 14px",
              background: "color-mix(in srgb, #a78bfa 8%, var(--fm-inset))",
              borderRadius: 10,
              border: "1px solid color-mix(in srgb, #a78bfa 35%, var(--fm-border))",
            }}>
              <Label>Como a IA vê a marca</Label>
              {data.percepcao_em_ia ? (
                <p style={{ fontSize: 14, lineHeight: 1.55 }}>{data.percepcao_em_ia}</p>
              ) : aiVisibility?.resumo ? (
                <p style={{ fontSize: 14, lineHeight: 1.55 }}>{aiVisibility.resumo}</p>
              ) : (
                <p style={{ fontSize: 13, color: "var(--fm-muted)", lineHeight: 1.5 }}>
                  Dados de Visibilidade em IA disponíveis — reaudite a percepção pra cruzar no texto.
                </p>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {data.ia_cita_marca ? (
                  <span style={{
                    fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                    padding: "3px 8px", borderRadius: 6, background: "var(--fm-surface)",
                    border: "1px solid var(--fm-border)",
                  }}>
                    cita marca: {data.ia_cita_marca}
                  </span>
                ) : null}
                {(aiVisibility?.nota_interna?.nota != null || data.evidencias?.visibilidade_ia?.nota != null) ? (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                    background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                  }}>
                    nota IA {aiVisibility?.nota_interna?.nota ?? data.evidencias?.visibilidade_ia?.nota}
                    {(aiVisibility?.nota_interna?.faixa || data.evidencias?.visibilidade_ia?.faixa)
                      ? ` · ${aiVisibility?.nota_interna?.faixa || data.evidencias?.visibilidade_ia?.faixa}`
                      : ""}
                  </span>
                ) : null}
              </div>
              {(() => {
                const prompts = (data.evidencias?.visibilidade_ia?.prompts?.length
                  ? data.evidencias.visibilidade_ia.prompts
                  : (aiVisibility?.prompts || []).map((p) => ({
                      prompt: p.prompt,
                      citado: !!p.engines?.[0]?.citado,
                      trecho: p.engines?.[0]?.trecho ?? null,
                    }))) || [];
                if (!prompts.length) return null;
                return (
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    {prompts.slice(0, 5).map((p, i) => (
                      <p key={i} style={{ fontSize: 12, lineHeight: 1.45, color: "var(--fm-muted)" }}>
                        <span style={{
                          color: p.citado ? "var(--fm-green)" : "var(--fm-red)",
                          fontWeight: 700, marginRight: 6,
                        }}>
                          {p.citado ? "✓ citado" : "✕ sumiu"}
                        </span>
                        “{p.prompt}”
                      </p>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : null}

          {gaps.length > 0 ? (
            <div>
              <Label>Gaps de percepção</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {gaps.map((g, i) => (
                  <div key={i} style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--fm-border)",
                  }}>
                    <p style={{ fontWeight: 650, fontSize: 13 }}>{g.gap}</p>
                    {g.evidencia ? (
                      <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4, lineHeight: 1.4 }}>
                        Evidência: {g.evidencia}
                      </p>
                    ) : null}
                    {g.risco_ou_oportunidade ? (
                      <p style={{ fontSize: 12, marginTop: 4 }}>{g.risco_ou_oportunidade}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="perc-grid2">
            {(data.o_que_reforcar?.length ?? 0) > 0 ? (
              <div>
                <Label>Reforçar</Label>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {data.o_que_reforcar!.map((t, i) => (
                    <li key={i} style={{ fontSize: 12, lineHeight: 1.45, marginBottom: 4 }}>{t}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {(data.o_que_corrigir?.length ?? 0) > 0 ? (
              <div>
                <Label>Corrigir</Label>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {data.o_que_corrigir!.map((t, i) => (
                    <li key={i} style={{ fontSize: 12, lineHeight: 1.45, marginBottom: 4 }}>{t}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {data.pitch_agencia ? (
            <div style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px dashed var(--fm-border)",
            }}>
              <Label>Pitch na reunião</Label>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>{data.pitch_agencia}</p>
            </div>
          ) : null}

          {/* Evidências resumidas */}
          {(igVids.length > 0 || ytVids.length > 0) ? (
            <div>
              <Label>Evidências de áudio / texto</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {igVids.map((v, i) => (
                  <div key={`ig-${i}`} style={evStyle}>
                    <p style={{ fontSize: 12, fontWeight: 650 }}>
                      IG {v.code || i + 1}
                      {v.metodo_audio ? ` · ${v.metodo_audio}` : ""}
                      {v.classificacao?.tom ? ` · tom ${v.classificacao.tom}` : ""}
                      {v.erro_audio && !v.transcricao ? ` · ${v.erro_audio}` : ""}
                    </p>
                    {v.caption ? (
                      <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2 }}>Caption: {v.caption}</p>
                    ) : null}
                    {v.transcricao ? (
                      <p style={{ fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>
                        “{v.transcricao.slice(0, 280)}{v.transcricao.length > 280 ? "…" : ""}”
                      </p>
                    ) : null}
                  </div>
                ))}
                {ytVids.map((v, i) => (
                  <div key={`yt-${i}`} style={evStyle}>
                    <p style={{ fontSize: 12, fontWeight: 650 }}>
                      YT {v.titulo || v.id || i + 1}
                      {v.metodo_audio ? ` · ${v.metodo_audio}` : ""}
                      {v.classificacao?.tom ? ` · tom ${v.classificacao.tom}` : ""}
                      {v.erro_audio && !v.transcricao ? ` · ${v.erro_audio}` : ""}
                    </p>
                    {v.transcricao ? (
                      <p style={{ fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>
                        “{v.transcricao.slice(0, 280)}{v.transcricao.length > 280 ? "…" : ""}”
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {imgs.length > 0 ? (
            <div>
              <Label>Leitura visual</Label>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 10,
              }}>
                {imgs.map((img, i) => (
                  <div key={i} style={{
                    borderRadius: 8,
                    border: "1px solid var(--fm-border)",
                    overflow: "hidden",
                    background: "var(--fm-inset)",
                  }}>
                    {img.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.thumbnail}
                        alt=""
                        style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}
                      />
                    ) : null}
                    <div style={{ padding: 8 }}>
                      <p style={{ fontSize: 11, lineHeight: 1.35, fontWeight: 550 }}>
                        {img.leitura || img.vende_o_que || "—"}
                      </p>
                      {img.tom ? (
                        <p style={{ fontSize: 10, color: "var(--fm-muted)", marginTop: 4 }}>{img.tom}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      <style>{`
        @media (max-width: 800px) {
          .perc-grid2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Card>
  );
}

const boxStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 10,
  border: "1px solid var(--fm-border)",
  background: "var(--fm-surface)",
};

const evStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid var(--fm-border)",
};
