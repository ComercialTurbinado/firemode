"use client";

import { useEffect, useRef, useState } from "react";
import { canaisPresencaFaltando } from "@/lib/presenca-scorecard-delta";

/**
 * Se a análise tem canais vazios/errados, dispara refresh do pipeline uma vez.
 * Também reage a `auto=1` na URL (ex.: vindo do perfil do cliente).
 */
export default function AutoPresencaFill({
  analiseId,
  presenca,
}: {
  analiseId: string;
  presenca: Record<string, unknown> | null;
}) {
  const started = useRef(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    const faltando = canaisPresencaFaltando(presenca);
    const params = new URLSearchParams(window.location.search);
    const forceAuto = params.get("auto") === "1";
    if (!faltando.length && !forceAuto) return;

    // Pipeline já rodando?
    const pipe = (presenca?.pipeline ?? null) as { status?: string; atualizado_em?: string } | null;
    if (pipe?.status === "running") return;
    if (pipe?.status === "done" && pipe.atualizado_em) {
      const ts = Date.parse(pipe.atualizado_em);
      if (!Number.isNaN(ts) && Date.now() - ts < 90_000 && !faltando.length) return;
    }

    started.current = true;
    const label = faltando.length
      ? `Preenchendo ${faltando.length} pesquisa(s) faltante(s)…`
      : "Atualizando presença…";
    setMsg(label);

    void (async () => {
      try {
        const res = await fetch("/api/conteudo/presenca/pipeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analise_web_id: analiseId,
            modo: "refresh",
            force: forceAuto && !faltando.length,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMsg(data.error || "Falha ao iniciar auto-fill");
          return;
        }
        setMsg(`Pipeline ${data.job_id?.slice?.(0, 8) ?? ""} em andamento — atualize em breve.`);
        // limpa ?auto=1 da URL sem reload
        if (forceAuto) {
          const u = new URL(window.location.href);
          u.searchParams.delete("auto");
          window.history.replaceState({}, "", u.pathname + u.search);
        }
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Erro no auto-fill");
      }
    })();
  }, [analiseId, presenca]);

  if (!msg) return null;

  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        background: "rgba(37,99,235,0.08)",
        border: "1px solid rgba(37,99,235,0.25)",
        fontSize: 13,
        color: "var(--fm-fg)",
        marginBottom: 16,
      }}
    >
      {msg}
    </div>
  );
}
