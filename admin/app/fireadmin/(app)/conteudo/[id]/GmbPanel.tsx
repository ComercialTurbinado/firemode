"use client";

import EspecialistaBloco from "./EspecialistaBloco";
import type { EspecialistaBloco as EspecialistaData } from "@/lib/especialista";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/AdminForm";

export type GmbPerfilCandidato = {
  place_id?: string | null;
  cid?: string | null;
  nome?: string;
  endereco?: string;
  telefone?: string;
  website?: string;
  avaliacao?: number;
  total_avaliacoes?: number;
  categoria?: string;
  score?: number;
  papel?: "oficial" | "filial" | "suspeito" | "rival" | "fraco" | string;
  motivos?: string[];
  riscos?: string[];
  escolhido?: boolean;
};

export type GmbData = {
  encontrado?: boolean;
  fonte?: string;
  erro?: string;
  resumo?: string;
  prioridade?: string;
  atualizado_em?: string;
  multiplos?: boolean;
  alerta_multiplos?: string | null;
  suspeitos_count?: number;
  filiais_count?: number;
  place_id_fixado?: string | null;
  precisa_escolher?: boolean;
  total_perfis?: number;
  aviso_sticky?: string | null;
  perfis_encontrados?: GmbPerfilCandidato[];
  candidatos?: GmbPerfilCandidato[];
  perfil?: {
    nome?: string;
    endereco?: string;
    telefone?: string;
    website?: string;
    avaliacao?: number;
    total_avaliacoes?: number;
    categoria?: string;
    place_id?: string;
    cid?: string;
    papel?: string;
    motivos_match?: string[];
    sugerido?: boolean;
  };
  score?: { ok?: number; total?: number };
  checklist?: { id: string; ok: boolean; label: string; detalhe: string; peso?: string }[];
  melhorias_rapidas?: {
    titulo: string;
    porque?: string;
    como?: string;
    esforco?: string;
    impacto?: string;
    categoria?: string;
  }[];
  especialista?: EspecialistaData | null;
  configuracoes_sugeridas?: string[];
  avaliacoes?: {
    autor?: string | { name?: string; thumbnail?: string; link?: string; reviews?: number; photos?: number };
    nota?: number;
    texto?: string;
    data?: string;
  }[];
  nota_interna?: {
    nota?: number;
    faixa?: string;
    breakdown?: Record<string, number>;
    calculado_em?: string;
  };
  historico_notas?: { em?: string; nota?: number; faixa?: string }[];
  nps?: {
    nps?: number | null;
    faixa?: string | null;
    amostra?: number;
    fonte?: string | null;
    media_estrelas_amostra?: number | null;
    pct_promotores?: number | null;
    pct_neutros?: number | null;
    pct_detratores?: number | null;
    temas?: { tema: string; mencoes: number; polaridade: string }[];
    temas_llm?: { tema: string; mencoes: number; polaridade: string }[];
    sintese_voz?: string | null;
    metodologia?: string;
  } | null;
  analise_mensagens?: {
    ok?: boolean;
    erro?: string | null;
    sintese?: string | null;
    dores_recorrentes?: string[];
    elogios_recorrentes?: string[];
    citacoes?: { texto?: string; fonte?: string; polaridade?: string }[];
    prioridade_acao?: string | null;
    acoes_sugeridas?: { titulo?: string; porque?: string; como?: string }[];
    alerta_reputacao?: string | null;
    fontes?: { gmb_textos?: number; ra_reclamacoes?: number; ra_pagina?: boolean };
  } | null;
  reclame_aqui?: {
    encontrado?: boolean;
    url?: string;
    slug?: string;
    query?: string;
    titulo_serp?: string;
    snippet_serp?: string;
    metricas?: {
      nota?: number;
      taxa_resposta?: number;
      taxa_resolucao?: number;
      voltaria_fazer_negocio?: number;
      total_reclamacoes?: number;
      selo_ou_status?: string;
    };
    fonte_leitura?: string;
    pagina_ok?: boolean;
    erro?: string;
    texto_resumo?: string | null;
    texto_completo?: string | null;
    reclamacoes?: {
      titulo?: string | null;
      texto?: string | null;
      texto_completo?: string | null;
      url?: string | null;
      status?: string | null;
      fonte?: string | null;
      erro?: string | null;
    }[];
    total_reclamacoes_lidas?: number | null;
  } | null;
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
  if (typeof value === "object" && value !== null && "name" in value) {
    const n = (value as { name?: unknown }).name;
    if (typeof n === "string") return n;
  }
  return fallback;
}

function autorNome(autor: unknown): string {
  if (typeof autor === "string" && autor.trim()) return autor;
  if (autor && typeof autor === "object" && "name" in autor) {
    const n = (autor as { name?: unknown }).name;
    if (typeof n === "string" && n.trim()) return n;
  }
  return "Anônimo";
}

const PAPEL_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  oficial: { bg: "rgba(21,128,61,0.12)", color: "var(--fm-green)", label: "oficial" },
  filial: { bg: "rgba(37,99,235,0.12)", color: "#3b82f6", label: "filial / duplicata" },
  suspeito: { bg: "rgba(220,38,38,0.12)", color: "var(--fm-red)", label: "suspeito" },
  rival: { bg: "rgba(161,98,7,0.12)", color: "var(--fm-yellow)", label: "rival?" },
  fraco: { bg: "var(--fm-hover)", color: "var(--fm-muted)", label: "fraco" },
};

export default function GmbPanel({
  analiseId,
  initial,
}: {
  analiseId: string;
  initial: GmbData | null | undefined;
}) {
  const router = useRouter();
  const [gmb, setGmb] = useState<GmbData | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [escolhendo, setEscolhendo] = useState<string | null>(null);
  const [raTextoAberto, setRaTextoAberto] = useState(false);
  const [reclamAberta, setReclamAberta] = useState<number | null>(null);

  async function atualizar(placeId?: string | null, opts?: { refazer_busca?: boolean }) {
    setLoading(true);
    setErro(null);
    if (placeId) setEscolhendo(placeId);
    try {
      // Em refresh normal, reenvia o place_id já travado (não depende só do sticky do CM)
      const fixado = opts?.refazer_busca
        ? undefined
        : (placeId || gmb?.place_id_fixado || undefined);

      const res = await fetch("/api/conteudo/gmb/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analise_web_id: analiseId,
          place_id: fixado || undefined,
          refazer_busca: Boolean(opts?.refazer_busca),
        }),
      });
      const data = await res.json().catch(() => ({})) as {
        error?: string;
        google_meu_negocio?: GmbData;
      };
      if (!res.ok) {
        throw new Error(data.error || `Falha ao atualizar GMB (HTTP ${res.status})`);
      }
      setGmb(data.google_meu_negocio ?? null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
      setEscolhendo(null);
    }
  }

  const nota = gmb?.nota_interna?.nota;
  const perfis = gmb?.perfis_encontrados?.length
    ? gmb.perfis_encontrados
    : gmb?.candidatos ?? [];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        <SectionTitle sub="Busca todas as listagens no Maps, você escolhe a oficial e o place_id fica travado nos próximos refreshes.">
          Google Meu Negócio
        </SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "stretch", flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => void atualizar()}
            disabled={loading}
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: loading ? "var(--fm-overlay)" : "var(--fm-accent)",
              color: loading ? "var(--fm-muted)" : "#fff",
              border: "none", cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading && !escolhendo ? "Atualizando…" : gmb ? "Atualizar GMB" : "Auditar GMB"}
          </button>
          {!!gmb && (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && !window.confirm(
                  "Zerar o place_id fixo e refazer a busca no Maps? Você vai precisar escolher de novo qual conta usar.",
                )) return;
                void atualizar(null, { refazer_busca: true });
              }}
              disabled={loading}
              style={{
                padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                background: "transparent",
                color: "var(--fm-muted)",
                border: "1px solid var(--fm-border)",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              Zerar e refazer busca
            </button>
          )}
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

      {!gmb ? (
        <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>
          Ainda sem auditoria nesta análise. Clique em <b>Auditar GMB</b> para buscar o perfil, avaliações e gerar a nota interna.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
              padding: "3px 10px", borderRadius: 20,
              background: gmb.encontrado ? "rgba(21,128,61,0.12)" : "rgba(220,38,38,0.12)",
              color: gmb.encontrado ? "var(--fm-green)" : "var(--fm-red)",
            }}>
              {gmb.encontrado ? "perfil encontrado" : "perfil não encontrado"}
            </span>
            {gmb.multiplos && (
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                padding: "3px 10px", borderRadius: 20,
                background: "rgba(161,98,7,0.12)", color: "var(--fm-yellow)",
              }}>
                múltiplos perfis
              </span>
            )}
            {(gmb.suspeitos_count ?? 0) > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                padding: "3px 10px", borderRadius: 20,
                background: "rgba(220,38,38,0.12)", color: "var(--fm-red)",
              }}>
                {gmb.suspeitos_count} suspeito(s)
              </span>
            )}
            {nota != null && (
              <span style={{
                fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums",
                color: notaColor(nota), letterSpacing: "-0.02em",
              }}>
                {nota}
                <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 6, color: "var(--fm-muted)" }}>
                  nota interna · {gmb.nota_interna?.faixa}
                </span>
              </span>
            )}
            {gmb.score && (
              <span style={{ fontSize: 12, color: "var(--fm-muted)", fontVariantNumeric: "tabular-nums" }}>
                checklist {gmb.score.ok ?? 0}/{gmb.score.total ?? 0}
              </span>
            )}
            {gmb.atualizado_em && (
              <span style={{ fontSize: 11, color: "var(--fm-muted)" }}>
                atualizado {new Date(gmb.atualizado_em).toLocaleString("pt-BR")}
              </span>
            )}
          </div>

          {(gmb.alerta_multiplos || gmb.aviso_sticky || gmb.precisa_escolher) && (
            <p style={{
              fontSize: 12, lineHeight: 1.5, padding: "10px 12px", borderRadius: 8,
              background: gmb.precisa_escolher ? "rgba(220,38,38,0.08)" : "rgba(161,98,7,0.08)",
              border: `1px solid ${gmb.precisa_escolher ? "rgba(220,38,38,0.25)" : "rgba(161,98,7,0.25)"}`,
              color: "var(--fm-text)",
            }}>
              {gmb.aviso_sticky ? <>{gmb.aviso_sticky}<br /></> : null}
              {gmb.alerta_multiplos}
              {gmb.place_id_fixado ? (
                <span style={{ color: "var(--fm-muted)" }}> · travado: {gmb.place_id_fixado.slice(0, 22)}…</span>
              ) : (
                <span style={{ color: "var(--fm-muted)" }}> · nenhum place_id travado</span>
              )}
            </p>
          )}

          {gmb.place_id_fixado && !gmb.alerta_multiplos && !gmb.precisa_escolher && (
            <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
              Place_id travado: <code style={{ fontSize: 10 }}>{gmb.place_id_fixado}</code>
              {" · "}Atualizar mantém esta conta. Use “Zerar e refazer busca” para escolher outra.
            </p>
          )}

          {gmb.nota_interna?.breakdown && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(gmb.nota_interna.breakdown).map(([k, v]) => (
                <span key={k} style={{
                  fontSize: 11, color: "var(--fm-muted)", background: "var(--fm-inset)",
                  border: "1px solid var(--fm-border)", borderRadius: 6, padding: "3px 8px",
                }}>
                  {k.replace("_", " ")}: <b style={{ color: "var(--fm-text)" }}>{v}</b>
                </span>
              ))}
            </div>
          )}

          {!!gmb.historico_notas && gmb.historico_notas.length > 1 && (
            <div>
              <Label>Histórico da nota</Label>
              <p style={{ fontSize: 12, color: "var(--fm-muted)" }}>
                {gmb.historico_notas.map((h) => h.nota).join(" → ")}
              </p>
            </div>
          )}

          {gmb.resumo && <p style={{ fontSize: 13, lineHeight: 1.55 }}>{txt(gmb.resumo, "")}</p>}
          {gmb.erro && <p style={{ fontSize: 12, color: "var(--fm-red)" }}>{txt(gmb.erro, "")}</p>}

          {perfis.length > 0 && (
            <div>
              <Label>
                Perfis encontrados na busca
                {gmb.total_perfis != null ? ` (${gmb.total_perfis})` : ` (${perfis.length})`}
              </Label>
              <p style={{ fontSize: 11, color: "var(--fm-muted)", marginBottom: 8 }}>
                Clique em <b>Usar este</b> para travar o place_id. Atualizar GMB depois disso não troca de conta.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflowY: "auto" }}>
                {perfis.map((p, i) => {
                  const papel = p.papel || "fraco";
                  const st = PAPEL_STYLE[papel] || PAPEL_STYLE.fraco;
                  const pid = p.place_id || p.cid || "";
                  const isSel = Boolean(
                    p.escolhido
                    || (gmb.place_id_fixado
                      && (p.place_id === gmb.place_id_fixado || p.cid === gmb.place_id_fixado)),
                  );
                  return (
                    <div
                      key={pid || `${p.nome}-${i}`}
                      style={{
                        padding: "12px 14px",
                        background: isSel ? "rgba(21,128,61,0.06)" : "var(--fm-inset)",
                        borderRadius: 8,
                        border: `1px solid ${isSel ? "rgba(21,128,61,0.35)" : "var(--fm-border)"}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                            <p style={{ fontWeight: 700, fontSize: 13 }}>{txt(p.nome)}</p>
                            <span style={{
                              fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                              padding: "2px 7px", borderRadius: 12, background: st.bg, color: st.color,
                            }}>
                              {st.label}
                            </span>
                            {isSel && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--fm-green)" }}>TRAVADO</span>
                            )}
                            {p.score != null && (
                              <span style={{ fontSize: 11, color: "var(--fm-muted)" }}>match {p.score}</span>
                            )}
                          </div>
                          <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4 }}>
                            {[
                              p.endereco,
                              p.avaliacao != null ? `${p.avaliacao}★` : null,
                              typeof p.total_avaliacoes === "number" ? `${p.total_avaliacoes} reviews` : null,
                              p.telefone,
                            ].filter(Boolean).join(" · ")}
                          </p>
                          {p.website && (
                            <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2, wordBreak: "break-all" }}>
                              {p.website}
                            </p>
                          )}
                          {(p.place_id || p.cid) && (
                            <p style={{ fontSize: 10, color: "var(--fm-muted)", marginTop: 4, wordBreak: "break-all" }}>
                              {p.place_id ? `place_id: ${p.place_id}` : null}
                              {p.place_id && p.cid ? " · " : null}
                              {p.cid ? `cid: ${p.cid}` : null}
                            </p>
                          )}
                          {!!p.motivos?.length && (
                            <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 6 }}>
                              {p.motivos.join(" · ")}
                            </p>
                          )}
                          {!!p.riscos?.length && (
                            <p style={{ fontSize: 11, color: "var(--fm-red)", marginTop: 4 }}>
                              {p.riscos.join(" · ")}
                            </p>
                          )}
                        </div>
                        {pid && !isSel && (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => void atualizar(pid)}
                            style={{
                              flexShrink: 0, padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                              background: "var(--fm-accent)", color: "#fff", border: "none",
                              cursor: loading ? "wait" : "pointer",
                            }}
                          >
                            {escolhendo === pid ? "Fixando…" : "Usar este"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {gmb.perfil && (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12, padding: 14, background: "var(--fm-inset)", borderRadius: 8,
              border: "1px solid var(--fm-border)",
            }}>
              <div>
                <Label>Nome</Label>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{txt(gmb.perfil.nome)}</p>
              </div>
              <div>
                <Label>Categoria</Label>
                <p style={{ fontSize: 13 }}>{txt(gmb.perfil.categoria)}</p>
              </div>
              <div>
                <Label>Avaliação</Label>
                <p style={{ fontSize: 13 }}>
                  {gmb.perfil.avaliacao != null ? `${gmb.perfil.avaliacao}★` : "—"}
                  {typeof gmb.perfil.total_avaliacoes === "number" ? ` · ${gmb.perfil.total_avaliacoes} reviews` : ""}
                </p>
              </div>
              <div>
                <Label>Telefone</Label>
                <p style={{ fontSize: 13 }}>{txt(gmb.perfil.telefone)}</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <Label>Endereço</Label>
                <p style={{ fontSize: 13 }}>{txt(gmb.perfil.endereco)}</p>
              </div>
              {typeof gmb.perfil.website === "string" && gmb.perfil.website && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Website no perfil</Label>
                  <p style={{ fontSize: 13, wordBreak: "break-all" }}>{gmb.perfil.website}</p>
                </div>
              )}
            </div>
          )}

          {gmb.nps && gmb.nps.nps != null && (
            <div style={{
              padding: 14, background: "var(--fm-inset)", borderRadius: 8,
              border: "1px solid var(--fm-border)",
            }}>
              <Label>NPS (a partir das avaliações do Google)</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "baseline", marginTop: 6 }}>
                <p style={{
                  fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em",
                  color: notaColor(gmb.nps.nps > 0 ? Math.min(100, gmb.nps.nps + 50) : Math.max(0, 50 + gmb.nps.nps / 2)),
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {gmb.nps.nps > 0 ? `+${gmb.nps.nps}` : gmb.nps.nps}
                </p>
                <span style={{ fontSize: 12, color: "var(--fm-muted)" }}>
                  {gmb.nps.faixa} · amostra {gmb.nps.amostra ?? 0}
                  {gmb.nps.fonte ? ` · ${gmb.nps.fonte}` : ""}
                </span>
              </div>
              {(gmb.nps.pct_promotores != null || gmb.nps.pct_detratores != null) && (
                <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 6 }}>
                  Promotores {gmb.nps.pct_promotores ?? "—"}% · Neutros {gmb.nps.pct_neutros ?? "—"}% · Detratores {gmb.nps.pct_detratores ?? "—"}%
                </p>
              )}
              {!!gmb.nps.temas?.length && (
                <p style={{ fontSize: 12, marginTop: 8 }}>
                  Temas: {gmb.nps.temas.map((t) => `${t.tema} (${t.polaridade}, ${t.mencoes})`).join(" · ")}
                </p>
              )}
              {gmb.nps.sintese_voz && (
                <p style={{ fontSize: 12, marginTop: 8, lineHeight: 1.45 }}>{gmb.nps.sintese_voz}</p>
              )}
              {gmb.nps.metodologia && (
                <p style={{ fontSize: 10, color: "var(--fm-muted)", marginTop: 6 }}>{gmb.nps.metodologia}</p>
              )}
            </div>
          )}

          {gmb.analise_mensagens?.ok && (
            <div style={{
              padding: 14, background: "var(--fm-inset)", borderRadius: 8,
              border: "1px solid var(--fm-border)",
            }}>
              <Label>Análise das mensagens (GMB + Reclame Aqui)</Label>
              {gmb.analise_mensagens.alerta_reputacao && (
                <p style={{
                  fontSize: 12, marginTop: 8, padding: "8px 10px", borderRadius: 6,
                  background: "rgba(239,68,68,0.1)", color: "var(--fm-red)", lineHeight: 1.45,
                }}>
                  {gmb.analise_mensagens.alerta_reputacao}
                </p>
              )}
              {gmb.analise_mensagens.sintese && (
                <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{gmb.analise_mensagens.sintese}</p>
              )}
              {gmb.analise_mensagens.prioridade_acao && (
                <p style={{ fontSize: 12, marginTop: 8, color: "var(--fm-muted)" }}>
                  Prioridade: {gmb.analise_mensagens.prioridade_acao}
                </p>
              )}
              {!!gmb.analise_mensagens.dores_recorrentes?.length && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--fm-muted)", marginBottom: 4 }}>Dores</p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.5 }}>
                    {gmb.analise_mensagens.dores_recorrentes.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!!gmb.analise_mensagens.elogios_recorrentes?.length && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--fm-muted)", marginBottom: 4 }}>Elogios</p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.5 }}>
                    {gmb.analise_mensagens.elogios_recorrentes.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!!gmb.analise_mensagens.citacoes?.length && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--fm-muted)" }}>Citações</p>
                  {gmb.analise_mensagens.citacoes.map((c, i) => (
                    <blockquote
                      key={i}
                      style={{
                        margin: 0, padding: "8px 10px", borderLeft: "3px solid var(--fm-border)",
                        fontSize: 12, lineHeight: 1.45, color: "var(--fm-muted)",
                      }}
                    >
                      “{c.texto}”
                      {(c.fonte || c.polaridade) && (
                        <span style={{ display: "block", marginTop: 4, fontSize: 10 }}>
                          {[c.fonte, c.polaridade].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </blockquote>
                  ))}
                </div>
              )}
              {gmb.analise_mensagens.fontes && (
                <p style={{ fontSize: 10, color: "var(--fm-muted)", marginTop: 10 }}>
                  Fontes: {gmb.analise_mensagens.fontes.gmb_textos ?? 0} textos GMB
                  {gmb.analise_mensagens.fontes.ra_reclamacoes
                    ? ` · ${gmb.analise_mensagens.fontes.ra_reclamacoes} reclamações RA`
                    : ""}
                  {gmb.analise_mensagens.fontes.ra_pagina ? " · página RA" : ""}
                </p>
              )}
            </div>
          )}

          {gmb.reclame_aqui && (
            <div style={{
              padding: 14, background: "var(--fm-inset)", borderRadius: 8,
              border: "1px solid var(--fm-border)",
            }}>
              <Label>Reclame Aqui (Google → abrir página)</Label>
              {!gmb.reclame_aqui.encontrado ? (
                <p style={{ fontSize: 13, color: "var(--fm-muted)", marginTop: 6 }}>
                  Não achamos página no RA para esta marca.
                  {gmb.reclame_aqui.erro ? ` (${gmb.reclame_aqui.erro})` : ""}
                </p>
              ) : (
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                  {gmb.reclame_aqui.url && (
                    <a
                      href={gmb.reclame_aqui.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 13, fontWeight: 600, color: "var(--fm-accent)", wordBreak: "break-all" }}
                    >
                      {gmb.reclame_aqui.titulo_serp || gmb.reclame_aqui.url}
                    </a>
                  )}
                  {gmb.reclame_aqui.snippet_serp && (
                    <p style={{ fontSize: 12, color: "var(--fm-muted)", lineHeight: 1.45 }}>
                      {gmb.reclame_aqui.snippet_serp}
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
                    leitura: {gmb.reclame_aqui.fonte_leitura || "—"}
                    {gmb.reclame_aqui.pagina_ok === false ? " · página não abriu (usou SERP)" : ""}
                    {gmb.reclame_aqui.erro ? ` · ${gmb.reclame_aqui.erro}` : ""}
                    {gmb.reclame_aqui.total_reclamacoes_lidas
                      ? ` · ${gmb.reclame_aqui.total_reclamacoes_lidas} reclamações lidas`
                      : ""}
                  </p>
                  {gmb.reclame_aqui.metricas && Object.keys(gmb.reclame_aqui.metricas).length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                      {gmb.reclame_aqui.metricas.nota != null && (
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--fm-border)" }}>
                          nota <b>{gmb.reclame_aqui.metricas.nota}</b>
                        </span>
                      )}
                      {gmb.reclame_aqui.metricas.taxa_resposta != null && (
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--fm-border)" }}>
                          resposta <b>{gmb.reclame_aqui.metricas.taxa_resposta}%</b>
                        </span>
                      )}
                      {gmb.reclame_aqui.metricas.taxa_resolucao != null && (
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--fm-border)" }}>
                          resolução <b>{gmb.reclame_aqui.metricas.taxa_resolucao}%</b>
                        </span>
                      )}
                      {gmb.reclame_aqui.metricas.voltaria_fazer_negocio != null && (
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--fm-border)" }}>
                          voltaria <b>{gmb.reclame_aqui.metricas.voltaria_fazer_negocio}%</b>
                        </span>
                      )}
                      {gmb.reclame_aqui.metricas.selo_ou_status && (
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--fm-border)" }}>
                          {gmb.reclame_aqui.metricas.selo_ou_status}
                        </span>
                      )}
                    </div>
                  )}

                  {!!gmb.reclame_aqui.reclamacoes?.length && (
                    <div style={{ marginTop: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--fm-muted)", marginBottom: 6 }}>
                        Reclamações (texto completo)
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {gmb.reclame_aqui.reclamacoes.map((r, i) => {
                          const corpo = r.texto_completo || r.texto || "";
                          const aberto = reclamAberta === i;
                          const curto = corpo.length > 500 && !aberto;
                          return (
                            <div
                              key={i}
                              style={{
                                padding: "10px 12px", borderRadius: 8,
                                border: "1px solid var(--fm-border)", background: "var(--fm-bg)",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                <p style={{ fontWeight: 600, fontSize: 13 }}>
                                  {r.titulo || `Reclamação ${i + 1}`}
                                </p>
                                {r.status && (
                                  <span style={{ fontSize: 10, color: "var(--fm-muted)", flexShrink: 0 }}>
                                    {r.status}
                                  </span>
                                )}
                              </div>
                              {corpo && (
                                <p style={{
                                  marginTop: 6, fontSize: 12, color: "var(--fm-muted)",
                                  lineHeight: 1.5, whiteSpace: "pre-wrap",
                                }}>
                                  {curto ? `${corpo.slice(0, 500)}…` : corpo}
                                </p>
                              )}
                              <div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "center" }}>
                                {corpo.length > 500 && (
                                  <button
                                    type="button"
                                    onClick={() => setReclamAberta(aberto ? null : i)}
                                    style={{
                                      fontSize: 11, background: "none", border: "none",
                                      color: "var(--fm-accent)", cursor: "pointer", padding: 0,
                                    }}
                                  >
                                    {aberto ? "Recolher" : "Ver texto completo"}
                                  </button>
                                )}
                                {r.url && (
                                  <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: 11, color: "var(--fm-accent)" }}
                                  >
                                    Abrir no RA
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(gmb.reclame_aqui.texto_completo || gmb.reclame_aqui.texto_resumo) && (
                    <div style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={() => setRaTextoAberto((v) => !v)}
                        style={{
                          fontSize: 11, fontWeight: 600, background: "none", border: "none",
                          color: "var(--fm-accent)", cursor: "pointer", padding: 0,
                        }}
                      >
                        {raTextoAberto ? "Ocultar texto da página RA" : "Ver texto completo da página RA"}
                      </button>
                      {raTextoAberto && (
                        <pre style={{
                          marginTop: 8, padding: 12, maxHeight: 360, overflow: "auto",
                          fontSize: 11, lineHeight: 1.45, whiteSpace: "pre-wrap",
                          wordBreak: "break-word", borderRadius: 8,
                          border: "1px solid var(--fm-border)", background: "var(--fm-bg)",
                          fontFamily: "inherit", color: "var(--fm-muted)",
                        }}>
                          {gmb.reclame_aqui.texto_completo || gmb.reclame_aqui.texto_resumo}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!!gmb.avaliacoes?.length && (
            <div>
              <Label>Avaliações recentes ({gmb.avaliacoes.length})</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, maxHeight: 280, overflowY: "auto" }}>
                {gmb.avaliacoes.map((a, i) => (
                  <div key={i} style={{
                    padding: "10px 12px", background: "var(--fm-inset)", borderRadius: 8,
                    border: "1px solid var(--fm-border)", fontSize: 13,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <p style={{ fontWeight: 600 }}>
                        {autorNome(a.autor)} · {a.nota != null ? `${a.nota}★` : "—"}
                      </p>
                      {a.data && <span style={{ fontSize: 11, color: "var(--fm-muted)" }}>{txt(a.data, "")}</span>}
                    </div>
                    {typeof a.texto === "string" && a.texto && (
                      <p style={{ marginTop: 4, color: "var(--fm-muted)", lineHeight: 1.45 }}>{a.texto}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!gmb.checklist?.length && (
            <div>
              <Label>Checklist público</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {gmb.checklist.map((c) => (
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

          {!!gmb.especialista && (
            <EspecialistaBloco data={gmb.especialista} />
          )}

          {!!gmb.melhorias_rapidas?.length && (
            <div>
              <Label>Melhorias rápidas</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {gmb.melhorias_rapidas.map((m, i) => (
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

          {!!gmb.configuracoes_sugeridas?.length && (
            <div>
              <Label>Configurações sugeridas no painel</Label>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
                {gmb.configuracoes_sugeridas.map((cfg, i) => (
                  <li key={i} style={{ color: "var(--fm-muted)" }}>{txt(cfg, "")}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
