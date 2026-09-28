"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const SESSION_KEY = "fm_apresentacao_session";

function getSessionKey(): string {
  if (typeof window === "undefined") return "default";
  try {
    let k = localStorage.getItem(SESSION_KEY);
    if (!k) {
      k = `s_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
      localStorage.setItem(SESSION_KEY, k);
    }
    return k;
  } catch {
    return "default";
  }
}

export type CanalMark = { id: string; label: string };

export function useApresentacaoInteresses(analiseId?: string) {
  const [marcados, setMarcados] = useState<CanalMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionKey, setSessionKey] = useState("default");

  useEffect(() => {
    setSessionKey(getSessionKey());
  }, []);

  const refresh = useCallback(async () => {
    if (!analiseId) return;
    try {
      const res = await fetch(
        `/api/conteudo/apresentacao/interesse?analise_web_id=${encodeURIComponent(analiseId)}&session_key=${encodeURIComponent(getSessionKey())}`,
      );
      const json = await res.json();
      if (!res.ok) return;
      const list = (json.interesses || []).map((i: { canal_id: string; canal_label: string }) => ({
        id: i.canal_id,
        label: i.canal_label,
      }));
      setMarcados(list);
    } catch {
      /* ignore */
    }
  }, [analiseId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const ids = useMemo(() => new Set(marcados.map((m) => m.id)), [marcados]);

  async function toggle(canal: CanalMark) {
    if (!analiseId) return;
    const next = !ids.has(canal.id);
    setMarcados((prev) =>
      next
        ? [...prev.filter((p) => p.id !== canal.id), canal]
        : prev.filter((p) => p.id !== canal.id),
    );
    setLoading(true);
    try {
      await fetch("/api/conteudo/apresentacao/interesse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analise_web_id: analiseId,
          canal_id: canal.id,
          canal_label: canal.label,
          session_key: getSessionKey(),
          marcado: next,
        }),
      });
    } catch {
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function pedirProposta(opts: {
    modo: "marcado" | "tudo";
    empresa: string;
    canaisFallback?: CanalMark[];
  }): Promise<{ ok: boolean; whatsapp_url?: string | null; aviso?: string | null; error?: string }> {
    if (!analiseId) return { ok: false, error: "sem análise" };
    const canais =
      opts.modo === "tudo"
        ? (opts.canaisFallback || [])
        : marcados;

    const res = await fetch("/api/conteudo/apresentacao/proposta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analise_web_id: analiseId,
        modo: opts.modo,
        empresa: opts.empresa,
        canais,
        session_key: getSessionKey(),
      }),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error || "falha" };
    return {
      ok: true,
      whatsapp_url: json.whatsapp_url,
      aviso: json.aviso,
    };
  }

  return {
    marcados,
    ids,
    loading,
    sessionKey,
    toggle,
    pedirProposta,
    refresh,
  };
}
