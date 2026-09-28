"use client";

import { useState } from "react";

type Props = {
  pautaId: string;
  titulo: string;
  clienteHandle: string | null;
  analiseId: string;
  status: string;
  gerando: boolean;
  trilhaPronta: boolean;
  faltantes: string[];
  onIniciado: (jobId: string) => void;
};

export default function PautaStatusAction({
  pautaId,
  titulo,
  clienteHandle,
  analiseId,
  status,
  gerando,
  trilhaPronta,
  faltantes,
  onIniciado,
}: Props) {
  const [hover, setHover] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (status === "produzido") {
    return (
      <span style={{
        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
        color: "var(--fm-green)",
      }}>
        produzido
      </span>
    );
  }

  if (gerando) {
    return (
      <span style={{
        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
        color: "#3b82f6",
      }}>
        gerando…
      </span>
    );
  }

  if (status !== "pendente") {
    return (
      <span style={{
        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
        color: "var(--fm-muted)",
      }}>
        {status}
      </span>
    );
  }

  if (erro) {
    return (
      <button
        type="button"
        title={erro}
        onClick={() => setErro(null)}
        style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
          color: "var(--fm-red)", background: "none", border: "none", cursor: "pointer", padding: 0,
        }}
      >
        erro · retry
      </button>
    );
  }

  const pode = Boolean(clienteHandle) && trilhaPronta && !busy;
  const bloqueio = !clienteHandle
    ? "Cliente não vinculado"
    : !trilhaPronta
      ? `Trilha incompleta: ${faltantes.join("; ") || "faltam análises"}`
      : `Gerar: ${titulo}`;

  async function iniciar() {
    if (!pode) return;
    setBusy(true);
    setErro(null);
    try {
      const res = await fetch("/api/conteudo/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pauta_id: pautaId,
          cliente_handle: clienteHandle,
          analise_web_id: analiseId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao iniciar");
      onIniciado(data.job_id);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao iniciar");
    } finally {
      setBusy(false);
    }
  }

  const ativo = hover || busy;

  return (
    <button
      type="button"
      onClick={iniciar}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={!pode}
      title={bloqueio}
      style={{
        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
        color: !trilhaPronta
          ? "var(--fm-yellow)"
          : ativo ? "var(--fm-accent)" : "var(--fm-muted)",
        background: ativo && trilhaPronta ? "var(--fm-accent-soft)" : "transparent",
        border: `1px solid ${ativo && trilhaPronta ? "var(--fm-accent)" : "transparent"}`,
        borderRadius: 6, padding: "3px 8px",
        cursor: pode ? "pointer" : "not-allowed",
        transition: "color 0.12s, background-color 0.12s, border-color 0.12s",
        opacity: pode || !trilhaPronta ? 1 : 0.5,
      }}
    >
      {busy ? "iniciando…" : !trilhaPronta ? "trilha" : ativo ? "criar novo" : "pendente"}
    </button>
  );
}
