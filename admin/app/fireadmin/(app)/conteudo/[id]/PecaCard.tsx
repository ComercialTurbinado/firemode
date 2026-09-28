"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type Peca = {
  id: string;
  tipo: string;
  status: string;
  titulo: string | null;
  palavra_chave: string | null;
  plataforma: string | null;
  angulo: string | null;
  cunho: string | null;
  etapa_funil: string | null;
  artigo_ref: string | null;
  lote_id: string | null;
  payload: Record<string, unknown>;
  validacao: { aprovado?: boolean; resumo?: string; palavras?: number } | null;
};

const STATUS_COLOR: Record<string, string> = {
  rascunho: "#eab308", aprovado: "#22c55e", em_producao: "#3b82f6",
  publicado: "#22c55e", descartado: "#6b7280",
};

export const CUNHO_LABEL: Record<string, string> = {
  explicacao: "Explicação",
  comercial: "Comercial",
  tendencia: "Tendência",
  news: "News",
  funil: "Funil",
};

export const ETAPA_LABEL: Record<string, string> = {
  topo: "Topo",
  meio: "Meio",
  fundo: "Fundo",
};

const CUNHO_COLOR: Record<string, string> = {
  explicacao: "#3b82f6",
  comercial: "#f59e0b",
  tendencia: "#a855f7",
  news: "#06b6d4",
  funil: "#22c55e",
};

function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      fontSize: 11, padding: "1px 8px", borderRadius: 6, marginRight: 6,
      border: `1px solid ${color ?? "var(--fm-border)"}`, color: color ?? "var(--fm-muted)",
    }}>
      {children}
    </span>
  );
}

export default function PecaCard({ peca }: { peca: Peca }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [desiaBusy, setDesiaBusy] = useState(false);
  const [desiaMsg, setDesiaMsg] = useState<string | null>(null);
  const p = peca.payload ?? {};
  const cunho = peca.cunho || (typeof p.cunho === "string" ? p.cunho : null);
  const etapa = peca.etapa_funil || (typeof p.etapa_funil === "string" ? p.etapa_funil : null);
  const jaDesia = Boolean((p.desia as { aplicado?: boolean } | undefined)?.aplicado);

  async function desiaizar() {
    if (desiaBusy || peca.tipo !== "artigo") return;
    setDesiaBusy(true);
    setDesiaMsg(null);
    try {
      const res = await fetch("/api/conteudo/desiaizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peca_id: peca.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na desIAização");
      const antes = (data.muletas_antes || []).length;
      const depois = (data.muletas_depois || []).length;
      setDesiaMsg(`DesIAizado · muletas ${antes}→${depois}`);
      router.refresh();
    } catch (e) {
      setDesiaMsg(e instanceof Error ? e.message : "Erro");
    } finally {
      setDesiaBusy(false);
    }
  }

  return (
    <div style={{ background: "var(--fm-inset)", borderRadius: 8, border: "1px solid var(--fm-border)" }}>
      <button
        onClick={() => setAberto((v) => !v)}
        style={{
          width: "100%", textAlign: "left", background: "none", border: "none",
          cursor: "pointer", padding: "12px 16px", color: "inherit",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {peca.titulo ?? (p.gancho as string) ?? (p.h1 as string) ?? "sem título"}
          </p>
          <div style={{ marginTop: 4 }}>
            {cunho && (
              <Tag color={CUNHO_COLOR[cunho] ?? "var(--fm-accent)"}>
                {CUNHO_LABEL[cunho] ?? cunho}
                {etapa ? ` · ${ETAPA_LABEL[etapa] ?? etapa}` : ""}
              </Tag>
            )}
            {peca.plataforma && <Tag color="var(--fm-accent)">{peca.plataforma}</Tag>}
            {peca.angulo && <Tag>{peca.angulo}</Tag>}
            {peca.validacao?.resumo && (
              <Tag color={peca.validacao.aprovado ? "var(--fm-green)" : "var(--fm-red)"}>
                {peca.validacao.resumo}
              </Tag>
            )}
          </div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase", flexShrink: 0,
          color: STATUS_COLOR[peca.status] ?? "var(--fm-muted)",
        }}>
          {peca.status} {aberto ? "▲" : "▼"}
        </span>
      </button>

      {aberto && (
        <div style={{ padding: "0 16px 16px", fontSize: 13, lineHeight: 1.6 }}>
          {peca.tipo === "artigo" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={desiaizar}
                disabled={desiaBusy}
                style={{
                  fontSize: 11,
                  fontWeight: 650,
                  padding: "5px 10px",
                  borderRadius: 7,
                  border: "1px solid var(--fm-border)",
                  background: desiaBusy ? "var(--fm-inset)" : "var(--fm-surface)",
                  color: "var(--fm-accent)",
                  cursor: desiaBusy ? "wait" : "pointer",
                }}
              >
                {desiaBusy ? "DesIAizando…" : jaDesia ? "DesIAizar de novo" : "DesIAizar texto"}
              </button>
              {desiaMsg ? (
                <span style={{ fontSize: 11, color: "var(--fm-muted)" }}>{desiaMsg}</span>
              ) : jaDesia ? (
                <span style={{ fontSize: 11, color: "var(--fm-green)" }}>já passou desIA</span>
              ) : null}
            </div>
          )}
          {peca.tipo === "artigo" && <Artigo p={p} />}
          {peca.tipo === "video" && <Video p={p} />}
          {peca.tipo === "post" && <Post p={p} />}
          {peca.tipo === "ad" && <Ad p={p} />}
          <CopyJson value={p} />
        </div>
      )}
    </div>
  );
}

function K({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "var(--fm-muted)" }}>{children}</span>;
}

function Artigo({ p }: { p: Record<string, unknown> }) {
  const meta = (p.meta ?? {}) as { title?: string; description?: string };
  const blocos = (p.blocos ?? []) as { tipo: string; texto?: string; nivel?: number; itens?: string[] }[];
  const marcadores = (p.requer_preenchimento_humano ?? []) as { tipo: string; instrucao: string }[];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {p.slug ? <p><K>slug:</K> {String(p.slug)}</p> : null}
      {meta.title ? <p><K>meta title:</K> {meta.title}</p> : null}
      {meta.description ? <p><K>meta description:</K> {meta.description}</p> : null}
      {marcadores.length > 0 && (
        <p style={{ color: "var(--fm-yellow)" }}>
          ⚠ Preencher: {marcadores.map((m) => `[${m.tipo}]`).join(" ")}
        </p>
      )}
      <details style={{ marginTop: 6 }}>
        <summary style={{ cursor: "pointer", color: "var(--fm-muted)" }}>
          Ver artigo ({blocos.length} blocos)
        </summary>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflow: "auto" }}>
          {blocos.map((b, i) => {
            if (b.tipo === "heading") {
              return <p key={i} style={{ fontWeight: 700, fontSize: b.nivel === 2 ? 14 : 13, marginTop: 6 }}>{b.texto}</p>;
            }
            if (b.tipo === "lista") {
              return <ul key={i} style={{ margin: 0, paddingLeft: 18 }}>{(b.itens ?? []).map((it, j) => <li key={j}>{it}</li>)}</ul>;
            }
            return <p key={i}>{b.texto}</p>;
          })}
        </div>
      </details>
    </div>
  );
}

function Video({ p }: { p: Record<string, unknown> }) {
  const cenas = (p.cenas ?? []) as { n: number; de_seg?: number; ate_seg?: number; fala?: string; ve?: string; texto_na_tela?: string }[];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {p.tipo_de_gancho ? <p><K>tipo de gancho:</K> {String(p.tipo_de_gancho)}</p> : null}
      {p.duracao_estimada_seg ? <p><K>duração:</K> {String(p.duracao_estimada_seg)}s</p> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
        {cenas.map((c, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 8, borderTop: "1px dashed var(--fm-border)", paddingTop: 6 }}>
            <span style={{ color: "var(--fm-accent)", fontSize: 11 }}>{c.de_seg}–{c.ate_seg}s</span>
            <span>
              <b>Fala:</b> {c.fala}
              {c.ve ? <><br /><K><b>Vê:</b> {c.ve}</K></> : null}
              {c.texto_na_tela ? <><br /><K><b>Tela:</b> {c.texto_na_tela}</K></> : null}
            </span>
          </div>
        ))}
      </div>
      {p.cta ? <p style={{ marginTop: 6 }}><K>CTA:</K> {String(p.cta)}</p> : null}
    </div>
  );
}

function Post({ p }: { p: Record<string, unknown> }) {
  const slides = (p.slides ?? []) as { n: number; papel?: string; titulo?: string; texto?: string; nota_visual?: string }[];
  const hashtags = (p.hashtags ?? []) as string[];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p><K>formato:</K> {String(p.formato)}</p>
      {slides.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
          {slides.map((s, i) => (
            <div key={i} style={{
              background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
              borderRadius: 8, padding: "10px 12px",
            }}>
              <span style={{ color: "var(--fm-accent)", fontSize: 11, fontWeight: 700 }}>SLIDE {s.n} · {s.papel}</span>
              <p style={{ fontWeight: 600, marginTop: 2 }}>{s.titulo}</p>
              <p style={{ fontSize: 12 }}>{s.texto}</p>
              {s.nota_visual ? <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2 }}>Arte: {s.nota_visual}</p> : null}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ whiteSpace: "pre-wrap" }}>{String(p.legenda ?? "")}</p>
      )}
      {hashtags.length > 0 && <p style={{ color: "var(--fm-muted)", fontSize: 12 }}>{hashtags.join(" ")}</p>}
    </div>
  );
}

function Ad({ p }: { p: Record<string, unknown> }) {
  const plataforma = String(p.plataforma ?? "Meta");
  const lim = plataforma === "Google" ? [30, 90] : [40, 150];
  const titulo = String(p.titulo ?? "");
  const corpo = String(p.corpo ?? "");
  const cor = (len: number, max: number) => (len <= max ? "var(--fm-green)" : "var(--fm-red)");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p><b>{titulo}</b> <span style={{ fontSize: 11, color: cor(titulo.length, lim[0]) }}>({titulo.length}/{lim[0]})</span></p>
      <p>{corpo} <span style={{ fontSize: 11, color: cor(corpo.length, lim[1]) }}>({corpo.length}/{lim[1]})</span></p>
      {p.nivel_de_consciencia ? <p><K>consciência:</K> {String(p.nivel_de_consciencia)}</p> : null}
      {p.cta ? <p><K>CTA:</K> {String(p.cta)}</p> : null}
      {p.publico_sugerido ? <p><K>público:</K> {String(p.publico_sugerido)}</p> : null}
    </div>
  );
}

function CopyJson({ value }: { value: unknown }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(JSON.stringify(value, null, 2));
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1200);
      }}
      style={{
        marginTop: 10, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
        background: "var(--fm-inset)", color: "var(--fm-muted)", border: "1px solid var(--fm-border)", cursor: "pointer",
      }}
    >
      {copiado ? "Copiado" : "Copiar JSON"}
    </button>
  );
}
