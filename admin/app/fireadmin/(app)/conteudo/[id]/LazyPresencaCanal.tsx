"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Card } from "@/components/AdminForm";

/**
 * Busca um canal de presença sob demanda (presenca_canais) e monta o painel.
 * Evita embutir megabytes no HTML/RSC da página.
 */
export default function LazyPresencaCanal<P extends { analiseId: string; initial?: unknown }>({
  analiseId,
  chave,
  Panel,
  extraProps,
}: {
  analiseId: string;
  chave: string;
  Panel: ComponentType<P>;
  extraProps?: Omit<P, "analiseId" | "initial">;
}) {
  const [data, setData] = useState<unknown | null | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(undefined);
    setErro(null);
    void (async () => {
      try {
        const res = await fetch(
          `/api/conteudo/presenca/canal?analise_web_id=${encodeURIComponent(analiseId)}&chave=${encodeURIComponent(chave)}`,
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        if (!cancelled) setData(json.dados ?? null);
      } catch (e) {
        if (!cancelled) {
          setErro(e instanceof Error ? e.message : "Falha ao carregar");
          setData(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [analiseId, chave]);

  if (data === undefined) {
    return (
      <Card>
        <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>Carregando {chave.replace(/_/g, " ")}…</p>
      </Card>
    );
  }

  if (erro) {
    return (
      <Card>
        <p style={{ fontSize: 13, color: "var(--fm-red)" }}>{erro}</p>
      </Card>
    );
  }

  const props = {
    analiseId,
    initial: data,
    ...(extraProps as object),
  } as P;

  return <Panel {...props} />;
}
