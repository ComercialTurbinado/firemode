"use client";

import Link from "next/link";
import { useState } from "react";

type Analise = {
  id: string;
  cliente_handle: string | null;
  url: string;
  dominio: string | null;
  status: string;
  criado_em: string;
  diagnostico: { empresa?: string; nicho?: string } | null;
  etapas: { uso?: { custo_usd?: number; tokens_total?: number } } | null;
};

type Pauta = {
  id: string;
  analise_web_id: string;
  cliente_handle: string | null;
  titulo: string;
  palavra_chave: string | null;
  intencao: string | null;
  dificuldade: string | null;
  prioridade: number | null;
  lacuna: string | null;
  status: string;
  criado_em: string;
};

type Peca = {
  id: string;
  analise_ref: string | null;
  cliente_handle: string | null;
  tipo: string;
  status: string;
  titulo: string | null;
  palavra_chave: string | null;
  plataforma: string | null;
  angulo: string | null;
  criado_em: string;
};

const STATUS_ANALISE: Record<string, string> = {
  concluido: "#22c55e", processando: "#3b82f6", erro: "#ef4444",
};

const STATUS_PECA: Record<string, string> = {
  rascunho: "#eab308", aprovado: "#22c55e", em_producao: "#3b82f6",
  publicado: "#22c55e", descartado: "#6b7280",
};

const TABS = [
  { id: "analises", label: "Análises" },
  { id: "pauta", label: "Pauta editorial" },
  { id: "artigo", label: "Artigos" },
  { id: "video", label: "Roteiros" },
  { id: "post", label: "Posts" },
  { id: "ad", label: "Anúncios" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function fmt(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function StatusPill({ status, map }: { status: string; map: Record<string, string> }) {
  const color = map[status] ?? "#6b7280";
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
      background: `${color}18`, color, textTransform: "uppercase", letterSpacing: "0.04em",
    }}>
      {status}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
      borderRadius: 12, padding: "32px 24px", textAlign: "center", color: "var(--fm-muted)", fontSize: 13,
    }}>
      {children}
    </div>
  );
}

function Row({
  href, title, meta, right,
}: {
  href: string;
  title: string;
  meta: string;
  right?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
        borderRadius: 10, padding: "14px 20px", textDecoration: "none", color: "inherit",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {title}
        </p>
        <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 3 }}>{meta}</p>
      </div>
      {right ? <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>{right}</div> : null}
    </Link>
  );
}

export default function ConteudoTabs({
  analises,
  pautas,
  pecas,
  contagemPorAnalise,
}: {
  analises: Analise[];
  pautas: Pauta[];
  pecas: Peca[];
  contagemPorAnalise: Record<string, Record<string, number>>;
}) {
  const counts: Record<TabId, number> = {
    analises: analises.length,
    pauta: pautas.length,
    artigo: pecas.filter((p) => p.tipo === "artigo").length,
    video: pecas.filter((p) => p.tipo === "video").length,
    post: pecas.filter((p) => p.tipo === "post").length,
    ad: pecas.filter((p) => p.tipo === "ad").length,
  };

  const [aba, setAba] = useState<TabId>("analises");

  const empresaDe = (analiseId: string | null) => {
    if (!analiseId) return null;
    const a = analises.find((x) => x.id === analiseId);
    return a?.diagnostico?.empresa ?? a?.dominio ?? a?.cliente_handle ?? null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        display: "flex", gap: 2, overflowX: "auto",
        borderBottom: "1px solid var(--fm-border)", paddingBottom: 0,
      }}>
        {TABS.map((t) => {
          const n = counts[t.id];
          const ativa = aba === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setAba(t.id)}
              style={{
                flexShrink: 0, padding: "10px 14px", background: "none", border: "none",
                borderBottom: ativa ? "2px solid var(--fm-accent)" : "2px solid transparent",
                color: ativa ? "var(--fm-accent)" : "var(--fm-muted)",
                fontWeight: ativa ? 700 : 500, fontSize: 13,
                cursor: "pointer", whiteSpace: "nowrap",
                marginBottom: -1,
              }}
            >
              {t.label}
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>{n}</span>
            </button>
          );
        })}
      </div>

      {aba === "analises" && (
        !analises.length ? (
          <Empty>Nenhuma análise de site ainda. Rode uma pelo Content Machine.</Empty>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {analises.map((a) => {
              const c = contagemPorAnalise[a.id] ?? {};
              const uso = a.etapas?.uso;
              return (
                <Row
                  key={a.id}
                  href={`/fireadmin/conteudo/${a.id}`}
                  title={a.diagnostico?.empresa ?? a.dominio ?? a.url}
                  meta={[
                    fmt(a.criado_em),
                    a.cliente_handle ? `@${a.cliente_handle}` : null,
                    a.diagnostico?.nicho ?? null,
                  ].filter(Boolean).join(" · ")}
                  right={
                    <>
                      <div style={{ display: "flex", gap: 6 }}>
                        {(["artigo", "video", "post", "ad"] as const).map((t) =>
                          c[t] ? (
                            <span key={t} style={{ fontSize: 11, color: "var(--fm-muted)" }}>
                              {c[t]} {t}
                            </span>
                          ) : null,
                        )}
                      </div>
                      {uso?.custo_usd != null && (
                        <span style={{ fontSize: 11, color: "var(--fm-muted)", fontVariantNumeric: "tabular-nums" }}>
                          US$ {uso.custo_usd.toFixed(3)}
                        </span>
                      )}
                      <StatusPill status={a.status} map={STATUS_ANALISE} />
                    </>
                  }
                />
              );
            })}
          </div>
        )
      )}

      {aba === "pauta" && (
        !pautas.length ? (
          <Empty>Nenhuma pauta editorial ainda.</Empty>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pautas.map((p) => (
              <Row
                key={p.id}
                href={`/fireadmin/conteudo/${p.analise_web_id}?aba=pauta`}
                title={`${p.prioridade != null ? `${p.prioridade}. ` : ""}${p.titulo}`}
                meta={[
                  p.palavra_chave,
                  p.intencao,
                  p.dificuldade ? `dificuldade ${p.dificuldade}` : null,
                  empresaDe(p.analise_web_id),
                  p.cliente_handle ? `@${p.cliente_handle}` : null,
                ].filter(Boolean).join(" · ")}
                right={<StatusPill status={p.status} map={STATUS_PECA} />}
              />
            ))}
          </div>
        )
      )}

      {(aba === "artigo" || aba === "video" || aba === "post" || aba === "ad") && (() => {
        const itens = pecas.filter((p) => p.tipo === aba);
        if (!itens.length) {
          const labels: Record<TabId, string> = {
            analises: "", pauta: "", artigo: "artigos", video: "roteiros", post: "posts", ad: "anúncios",
          };
          return <Empty>Nenhum {labels[aba]} gerado ainda.</Empty>;
        }
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {itens.map((p) => (
              <Row
                key={p.id}
                href={p.analise_ref ? `/fireadmin/conteudo/${p.analise_ref}?aba=${p.tipo}` : "/fireadmin/conteudo"}
                title={p.titulo ?? "sem título"}
                meta={[
                  fmt(p.criado_em),
                  p.palavra_chave,
                  p.plataforma,
                  p.angulo,
                  empresaDe(p.analise_ref),
                  p.cliente_handle ? `@${p.cliente_handle}` : null,
                ].filter(Boolean).join(" · ")}
                right={<StatusPill status={p.status} map={STATUS_PECA} />}
              />
            ))}
          </div>
        );
      })()}
    </div>
  );
}
