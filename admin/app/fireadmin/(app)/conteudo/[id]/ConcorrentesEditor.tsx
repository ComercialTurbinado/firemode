"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addConcorrente,
  deleteConcorrente,
  setConcorrenteStatus,
  updateConcorrente,
} from "./concorrentes-actions";

export type ConcorrenteRow = {
  id: string;
  nome?: string | null;
  dominio?: string | null;
  aparicoes?: number | null;
  tipo?: string | null;
  fora_da_serp?: boolean | null;
  fonte?: string[] | null;
  status?: string | null;
  porque?: string | null;
  meta_extra?: {
    aparicoes_ia?: number;
    aparicoes_ads?: number;
    page_name?: string;
  } | null;
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "7px 10px", borderRadius: 6, fontSize: 13,
  border: "1px solid var(--fm-border)", background: "var(--fm-surface)", color: "var(--fm-text)",
};
const btnPrimary: React.CSSProperties = {
  padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
  background: "var(--fm-accent)", color: "#fff", border: "none", cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
  background: "transparent", color: "var(--fm-muted)", border: "1px solid var(--fm-border)", cursor: "pointer",
};
const btnTiny: React.CSSProperties = {
  padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600,
  background: "transparent", color: "var(--fm-muted)", border: "1px solid var(--fm-border)", cursor: "pointer",
};
const badgeGreen: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "var(--fm-green)",
  background: "color-mix(in srgb, var(--fm-green) 12%, transparent)",
  padding: "2px 7px", borderRadius: 20,
};
const badgeMuted: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "var(--fm-muted)",
  background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
  padding: "2px 7px", borderRadius: 20,
};
const badgeIa: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "#a78bfa",
  background: "color-mix(in srgb, #a78bfa 14%, transparent)",
  padding: "2px 7px", borderRadius: 20,
};
const badgeAds: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "#ec4899",
  background: "color-mix(in srgb, #ec4899 14%, transparent)",
  padding: "2px 7px", borderRadius: 20,
};
const badgeSug: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "#eab308",
  background: "color-mix(in srgb, #eab308 14%, transparent)",
  padding: "2px 7px", borderRadius: 20,
};

function fontesDe(c: ConcorrenteRow): string[] {
  if (Array.isArray(c.fonte) && c.fonte.length) return c.fonte.map(String);
  if (c.aparicoes) return ["serp"];
  if (c.fora_da_serp) return ["manual"];
  return [];
}

export default function ConcorrentesEditor({
  analiseId,
  iniciais,
}: {
  analiseId: string;
  iniciais: ConcorrenteRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [syncing, setSyncing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [dominio, setDominio] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoDominio, setNovoDominio] = useState("");

  function refresh() {
    router.refresh();
  }

  function startEdit(c: ConcorrenteRow) {
    setEditId(c.id);
    setNome(c.nome || "");
    setDominio(c.dominio || "");
    setErro(null);
  }

  function cancelEdit() {
    setEditId(null);
    setNome("");
    setDominio("");
  }

  function onSaveEdit() {
    if (!editId) return;
    setErro(null);
    startTransition(async () => {
      const r = await updateConcorrente({
        id: editId,
        analise_web_id: analiseId,
        nome,
        dominio,
      });
      if (!r.ok) {
        setErro(r.error || "Falha ao salvar");
        return;
      }
      cancelEdit();
      refresh();
    });
  }

  function onDelete(id: string) {
    if (!confirm("Remover este concorrente?")) return;
    setErro(null);
    startTransition(async () => {
      const r = await deleteConcorrente({ id, analise_web_id: analiseId });
      if (!r.ok) {
        setErro(r.error || "Falha ao remover");
        return;
      }
      if (editId === id) cancelEdit();
      refresh();
    });
  }

  function onStatus(id: string, status: "confirmado" | "rejeitado") {
    setErro(null);
    startTransition(async () => {
      const r = await setConcorrenteStatus({ id, analise_web_id: analiseId, status });
      if (!r.ok) {
        setErro(r.error || "Falha ao atualizar status");
        return;
      }
      refresh();
    });
  }

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    startTransition(async () => {
      const r = await addConcorrente({
        analise_web_id: analiseId,
        nome: novoNome,
        dominio: novoDominio,
      });
      if (!r.ok) {
        setErro(r.error || "Falha ao adicionar");
        return;
      }
      setNovoNome("");
      setNovoDominio("");
      refresh();
    });
  }

  async function onSync() {
    setSyncing(true);
    setErro(null);
    setInfo(null);
    try {
      const res = await fetch("/api/conteudo/concorrentes/sincronizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analise_web_id: analiseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no sync");
      setInfo(
        `Sync: +${json.adicionados ?? 0} sugeridos · ${json.mesclados ?? 0} mesclados (IA/Ads → lista).`,
      );
      refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro no sync");
    } finally {
      setSyncing(false);
    }
  }

  const sugeridos = iniciais.filter((c) => c.status === "sugerido");
  const ativos = iniciais.filter((c) => c.status !== "sugerido" && c.status !== "rejeitado");
  const rejeitados = iniciais.filter((c) => c.status === "rejeitado");

  function CardConcorrente(c: ConcorrenteRow) {
    const fontes = fontesDe(c);
    return (
      <div
        key={c.id}
        style={{
          fontSize: 13, padding: "10px 12px",
          background: c.status === "sugerido"
            ? "color-mix(in srgb, #eab308 6%, var(--fm-inset))"
            : "var(--fm-inset)",
          borderRadius: 8,
          border: c.status === "sugerido"
            ? "1px solid color-mix(in srgb, #eab308 35%, var(--fm-border))"
            : "1px solid var(--fm-border)",
        }}
      >
        {editId === c.id ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" style={inputStyle} />
            <input value={dominio} onChange={(e) => setDominio(e.target.value)} placeholder="dominio.com" style={inputStyle} />
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={onSaveEdit} disabled={pending} style={btnPrimary}>Salvar</button>
              <button type="button" onClick={cancelEdit} disabled={pending} style={btnGhost}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.nome ?? c.dominio}
              </p>
              <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2 }}>{c.dominio}</p>
              {c.porque && c.status === "sugerido" ? (
                <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4, lineHeight: 1.4 }}>{c.porque}</p>
              ) : null}
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                {c.status === "sugerido" ? <span style={badgeSug}>sugerido</span> : null}
                {fontes.includes("serp") || c.aparicoes ? (
                  <span style={badgeGreen}>{c.aparicoes ? `${c.aparicoes} SERP` : "serp"}</span>
                ) : null}
                {fontes.includes("ia") ? (
                  <span style={badgeIa}>
                    IA{c.meta_extra?.aparicoes_ia ? ` ${c.meta_extra.aparicoes_ia}×` : ""}
                  </span>
                ) : null}
                {fontes.includes("ads") ? (
                  <span style={badgeAds}>
                    ads{c.meta_extra?.aparicoes_ads ? ` ${c.meta_extra.aparicoes_ads}` : ""}
                  </span>
                ) : null}
                {fontes.includes("manual") ? <span style={badgeMuted}>manual</span> : null}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
              {c.status === "sugerido" ? (
                <>
                  <button type="button" onClick={() => onStatus(c.id, "confirmado")} disabled={pending} style={{ ...btnTiny, color: "var(--fm-green)" }}>
                    Confirmar
                  </button>
                  <button type="button" onClick={() => onStatus(c.id, "rejeitado")} disabled={pending} style={btnTiny}>
                    Descartar
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => startEdit(c)} disabled={pending} style={btnTiny}>Editar</button>
                  <button type="button" onClick={() => onDelete(c.id)} disabled={pending} style={{ ...btnTiny, color: "var(--fm-red)" }}>Remover</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button
          type="button"
          onClick={onSync}
          disabled={syncing || pending}
          style={{
            ...btnGhost,
            fontWeight: 700,
            color: "var(--fm-text)",
            opacity: syncing ? 0.6 : 1,
          }}
        >
          {syncing ? "Sincronizando…" : "Sincronizar IA + Ads"}
        </button>
      </div>

      {erro && (
        <p style={{
          fontSize: 12, color: "var(--fm-red)",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 8, padding: "8px 12px",
        }}>
          {erro}
        </p>
      )}
      {info && (
        <p style={{
          fontSize: 12, color: "var(--fm-muted)",
          background: "var(--fm-inset)", border: "1px solid var(--fm-border)",
          borderRadius: 8, padding: "8px 12px",
        }}>
          {info}
        </p>
      )}

      {sugeridos.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#eab308", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Sugeridos (IA / Ads) — confirme pra entrar no IG, Ads e posicionamento
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 10,
          }}>
            {sugeridos.map(CardConcorrente)}
          </div>
        </div>
      )}

      {!ativos.length && !sugeridos.length ? (
        <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>
          Nenhum concorrente. Rode a análise, sincronize IA/Ads ou adicione abaixo.
        </p>
      ) : ativos.length > 0 ? (
        <div>
          {sugeridos.length > 0 && (
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Confirmados
            </p>
          )}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 10,
          }}>
            {ativos.map(CardConcorrente)}
          </div>
        </div>
      ) : null}

      {rejeitados.length > 0 && (
        <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
          {rejeitados.length} descartado(s) — não entram nas auditorias.
        </p>
      )}

      <form onSubmit={onAdd} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome"
          style={{ ...inputStyle, maxWidth: 200 }}
        />
        <input
          value={novoDominio}
          onChange={(e) => setNovoDominio(e.target.value)}
          placeholder="dominio.com"
          required
          style={{ ...inputStyle, maxWidth: 220 }}
        />
        <button type="submit" disabled={pending} style={btnPrimary}>
          Adicionar
        </button>
      </form>
    </div>
  );
}
