"use client";

import { useEffect, useRef, useState } from "react";

/** No perfil do cliente: dispara refresh para análises com pesquisas faltando. */
export default function ClientePresencaAutoFill({
  itens,
}: {
  itens: { id: string; faltando: string[] }[];
}) {
  const started = useRef(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (started.current || !itens.length) return;
    started.current = true;
    const alvo = itens[0];
    setMsg(`Pesquisas faltando (${alvo.faltando.length}) — iniciando atualização…`);

    void (async () => {
      try {
        const res = await fetch("/api/conteudo/presenca/pipeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analise_web_id: alvo.id,
            modo: "refresh",
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMsg(data.error || "Falha ao preencher pesquisas");
          return;
        }
        setMsg(
          `Pipeline ${String(data.job_id || "").slice(0, 8)} rodando — abra a análise para acompanhar.`,
        );
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Erro");
      }
    })();
  }, [itens]);

  if (!msg) return null;

  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        background: "rgba(37,99,235,0.08)",
        border: "1px solid rgba(37,99,235,0.25)",
        fontSize: 13,
        marginBottom: 16,
      }}
    >
      {msg}{" "}
      {itens[0] ? (
        <a href={`/fireadmin/conteudo/${itens[0].id}`} style={{ color: "var(--fm-accent)", fontWeight: 600 }}>
          Ver análise →
        </a>
      ) : null}
    </div>
  );
}
