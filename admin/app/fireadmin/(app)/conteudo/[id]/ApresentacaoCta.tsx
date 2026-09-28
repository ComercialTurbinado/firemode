"use client";

import { useState } from "react";
import type { CanalMark } from "./useApresentacaoInteresses";

export function BotaoQueroResolver({
  marcado,
  loading,
  onToggle,
}: {
  marcado: boolean;
  loading?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={loading}
      style={{
        width: "100%",
        marginTop: 4,
        padding: "11px 14px",
        borderRadius: 10,
        border: marcado ? "1px solid var(--fm-accent)" : "1px solid var(--fm-border)",
        background: marcado
          ? "color-mix(in srgb, var(--fm-accent) 14%, transparent)"
          : "var(--fm-surface)",
        color: marcado ? "var(--fm-accent)" : "var(--fm-text)",
        fontWeight: 700,
        fontSize: 13,
        cursor: loading ? "wait" : "pointer",
      }}
      className="fm-no-print"
    >
      {marcado ? "✓ Marcado · entra na proposta" : "Quero resolver isto"}
    </button>
  );
}

export function StickyInteressesBar({
  marcados,
  onVerProposta,
}: {
  marcados: CanalMark[];
  onVerProposta: () => void;
}) {
  if (marcados.length === 0) return null;
  return (
    <div style={{
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
      padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
      background: "color-mix(in srgb, var(--fm-surface) 92%, transparent)",
      backdropFilter: "blur(10px)",
      borderTop: "1px solid var(--fm-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
    className="fm-no-print"
    >
      <p style={{ fontSize: 13, color: "var(--fm-muted)", margin: 0 }}>
        <b style={{ color: "var(--fm-text)" }}>{marcados.length}</b>
        {" "}
        {marcados.length === 1 ? "canal marcado" : "canais marcados"}
      </p>
      <button
        type="button"
        onClick={onVerProposta}
        style={{
          padding: "10px 16px",
          borderRadius: 10,
          border: "none",
          background: "var(--fm-accent)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Ver proposta
      </button>
    </div>
  );
}

export function CtaPropostaFinal({
  empresa,
  marcados,
  todosCanais,
  onPedir,
}: {
  empresa: string;
  marcados: CanalMark[];
  todosCanais: CanalMark[];
  onPedir: (modo: "marcado" | "tudo") => Promise<{
    ok: boolean;
    whatsapp_url?: string | null;
    aviso?: string | null;
    error?: string;
  }>;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const temMarcados = marcados.length > 0;

  async function run(modo: "marcado" | "tudo") {
    setBusy(true);
    setMsg(null);
    try {
      const r = await onPedir(modo);
      if (!r.ok) {
        setMsg(r.error || "Não foi possível registrar. Tente de novo.");
        return;
      }
      if (r.whatsapp_url) {
        window.open(r.whatsapp_url, "_blank", "noopener,noreferrer");
        setMsg("Registramos no admin. Abrindo WhatsApp…");
      } else {
        setMsg(r.aviso || "Registrado no admin. Configure o WhatsApp comercial no .env.");
      }
    } catch {
      setMsg("Falha de rede. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      background: "var(--fm-surface)",
      border: "1px solid var(--fm-border)",
      borderRadius: 14,
      padding: "22px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}>
      <div>
        <p style={{
          fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--fm-accent)", marginBottom: 8,
        }}>
          Próximo passo
        </p>
        <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
          Quer que a gente execute isso?
        </p>
        <p style={{ fontSize: 13, color: "var(--fm-muted)", marginTop: 6, lineHeight: 1.5 }}>
          {temMarcados
            ? `Você marcou ${marcados.length} ${marcados.length === 1 ? "canal" : "canais"} (${marcados.map((m) => m.label).join(", ")}). Mandamos a proposta só do que escolheu — ou do pacote completo.`
            : `Marque os canais com “Quero resolver isto” ao longo do diagnóstico, ou peça o pacote completo agora.`}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {temMarcados ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run("marcado")}
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              border: "none",
              background: "var(--fm-accent)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              cursor: busy ? "wait" : "pointer",
            }}
          >
            Receber proposta do que marquei
          </button>
        ) : null}

        <button
          type="button"
          disabled={busy}
          onClick={() => void run("tudo")}
          style={{
            padding: "14px 18px",
            borderRadius: 12,
            border: temMarcados ? "1px solid var(--fm-border)" : "none",
            background: temMarcados ? "var(--fm-inset)" : "var(--fm-accent)",
            color: temMarcados ? "var(--fm-text)" : "#fff",
            fontWeight: 800,
            fontSize: 14,
            cursor: busy ? "wait" : "pointer",
          }}
        >
          Quero resolver tudo agora
        </button>
      </div>

      {msg ? (
        <p style={{ fontSize: 12, color: "var(--fm-muted)", lineHeight: 1.45 }}>{msg}</p>
      ) : (
        <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
          Sem preço no meio do caminho — a proposta fecha no WhatsApp, com o que você pediu.
          {todosCanais.length ? ` · ${empresa}` : ""}
        </p>
      )}
    </div>
  );
}
