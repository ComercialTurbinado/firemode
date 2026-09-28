"use client";

import { fetchConteudoJson } from "@/lib/fetch-conteudo-json";
import { useEffect, useState } from "react";

type Interesse = {
  canal_id: string;
  canal_label: string;
  atualizado_em?: string;
  session_key?: string;
};

type Proposta = {
  id: string;
  modo: string;
  canais: { id?: string; label?: string }[];
  criado_em?: string;
};

function fmt(date?: string) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return date;
  }
}

/** Painel admin: intenções capturadas na apresentação. */
export default function ApresentacaoInteressesPanel({ analiseId }: { analiseId: string }) {
  const [interesses, setInteresses] = useState<Interesse[]>([]);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  async function load() {
    setErro(null);
    try {
      const [ja, jb] = await Promise.all([
        fetchConteudoJson<{ interesses?: Interesse[] }>(
          `/api/conteudo/apresentacao/interesse?analise_web_id=${encodeURIComponent(analiseId)}`,
        ),
        fetchConteudoJson<{ propostas?: Proposta[] }>(
          `/api/conteudo/apresentacao/propostas?analise_web_id=${encodeURIComponent(analiseId)}`,
        ),
      ]);
      setInteresses(ja.interesses || []);
      setPropostas(jb.propostas || []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
    }
  }

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 30_000);
    return () => clearInterval(t);
  }, [analiseId]);

  const porCanal = new Map<string, number>();
  for (const i of interesses) {
    porCanal.set(i.canal_label, (porCanal.get(i.canal_label) || 0) + 1);
  }

  return (
    <div style={{
      background: "var(--fm-surface)",
      border: "1px solid var(--fm-border)",
      borderRadius: 12,
      padding: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Interesses da apresentação</h2>
          <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4 }}>
            Canais marcados + pedidos de proposta (atualiza a cada 30s)
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          style={{
            fontSize: 12, padding: "6px 10px", borderRadius: 8,
            border: "1px solid var(--fm-border)", background: "var(--fm-inset)",
            color: "var(--fm-text)", cursor: "pointer",
          }}
        >
          Atualizar
        </button>
      </div>

      {erro ? <p style={{ fontSize: 12, color: "var(--fm-red)" }}>{erro}</p> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Marcados agora ({interesses.length})
          </p>
          {!interesses.length ? (
            <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>Ninguém marcou canal ainda.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
              {[...porCanal.entries()].map(([label, n]) => (
                <li key={label}>
                  <b>{label}</b>
                  {n > 1 ? <span style={{ color: "var(--fm-muted)" }}> · {n} sessões</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Propostas pedidas ({propostas.length})
          </p>
          {!propostas.length ? (
            <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>Nenhum CTA final ainda.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {propostas.slice(0, 8).map((p) => (
                <div key={p.id} style={{ fontSize: 12, lineHeight: 1.45 }}>
                  <b>{p.modo === "tudo" ? "Resolver tudo" : "Só o marcado"}</b>
                  <span style={{ color: "var(--fm-muted)" }}> · {fmt(p.criado_em)}</span>
                  {Array.isArray(p.canais) && p.canais.length > 0 ? (
                    <p style={{ color: "var(--fm-muted)", margin: "2px 0 0" }}>
                      {p.canais.map((c) => c.label || c.id).join(", ")}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
