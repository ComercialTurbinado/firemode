"use client";

import { useCallback, useEffect, useState } from "react";
import type { JobStatus } from "@/lib/content-machine";

type Props = {
  analiseId: string;
  url?: string | null;
  clienteHandle?: string | null;
};

const STORAGE_KEY = "fm-presenca-pipeline-job";

function lerJob(analiseId: string): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { analiseId: string; jobId: string };
    return parsed.analiseId === analiseId ? parsed.jobId : null;
  } catch {
    return null;
  }
}

function salvarJob(analiseId: string, jobId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analiseId, jobId }));
  } catch { /* ignore */ }
}

function limparJob() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export default function PresencaPipelineButton({
  analiseId,
  url,
  clienteHandle,
}: Props) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [force, setForce] = useState(false);
  const [aberto, setAberto] = useState(false);

  const poll = useCallback(async (id: string) => {
    const res = await fetch(`/api/conteudo/presenca/pipeline/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Job não encontrado");
    const data = (await res.json()) as JobStatus;
    setJob(data);
    if (data.status === "done" || data.status === "error") {
      limparJob();
      setLoading(false);
      if (data.status === "done") {
        // recarrega para ver dados novos
        window.setTimeout(() => window.location.reload(), 1200);
      }
    }
    return data;
  }, []);

  useEffect(() => {
    const existing = lerJob(analiseId);
    if (!existing) return;
    setJobId(existing);
    setAberto(true);
    setLoading(true);
  }, [analiseId]);

  useEffect(() => {
    if (!jobId || !loading) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const data = await poll(jobId);
        if (cancelled) return;
        if (data.status !== "done" && data.status !== "error") {
          window.setTimeout(tick, 2500);
        }
      } catch (e) {
        if (!cancelled) {
          setErro(e instanceof Error ? e.message : "Falha no poll");
          setLoading(false);
          limparJob();
        }
      }
    };
    void tick();
    return () => {
      cancelled = true;
    };
  }, [jobId, loading, poll]);

  async function iniciar() {
    setErro(null);
    setLoading(true);
    setAberto(true);
    setJob(null);
    try {
      const res = await fetch("/api/conteudo/presenca/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analise_web_id: analiseId,
          url: url || undefined,
          cliente_handle: clienteHandle || undefined,
          modo: "refresh",
          force,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Falha ao iniciar sequência");
      }
      const id = data.job_id as string;
      setJobId(id);
      salvarJob(analiseId, id);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
      setLoading(false);
    }
  }

  const rodando = loading && job?.status !== "done" && job?.status !== "error";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "var(--fm-muted)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
            disabled={rodando}
          />
          forçar (ignora TTL)
        </label>
        <button
          type="button"
          onClick={() => void iniciar()}
          disabled={rodando}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid var(--fm-border)",
            background: rodando ? "var(--fm-inset)" : "var(--fm-card)",
            color: "var(--fm-text)",
            fontWeight: 650,
            fontSize: 13,
            cursor: rodando ? "wait" : "pointer",
          }}
        >
          {rodando ? "Sequência rodando…" : "Atualizar presença"}
        </button>
      </div>

      {erro ? (
        <p style={{ fontSize: 12, color: "var(--fm-red)", maxWidth: 280, textAlign: "right" }}>
          {erro}
        </p>
      ) : null}

      {aberto && job ? (
        <div
          style={{
            width: "min(360px, 92vw)",
            background: "var(--fm-card)",
            border: "1px solid var(--fm-border)",
            borderRadius: 10,
            padding: "12px 14px",
            maxHeight: 320,
            overflow: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 700 }}>
              Sequência · {job.status}
              {job.current ? ` · ${job.current}` : ""}
            </p>
            <button
              type="button"
              onClick={() => setAberto(false)}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--fm-muted)",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              fechar
            </button>
          </div>
          {(job.steps || []).map((s) => (
            <div
              key={s.key}
              style={{
                display: "flex",
                gap: 8,
                fontSize: 11,
                padding: "4px 0",
                borderTop: "1px solid var(--fm-border)",
                color:
                  s.status === "error"
                    ? "var(--fm-red)"
                    : s.status === "running"
                      ? "var(--fm-accent)"
                      : s.status === "done"
                        ? "var(--fm-text)"
                        : "var(--fm-muted)",
              }}
            >
              <span style={{ width: 14, flexShrink: 0 }}>
                {s.status === "done" ? "✓" : s.status === "error" ? "✕" : s.status === "running" ? "…" : "○"}
              </span>
              <span style={{ flex: 1 }}>
                {s.label}
                {s.detail ? (
                  <span style={{ color: "var(--fm-muted)" }}> · {s.detail}</span>
                ) : null}
              </span>
            </div>
          ))}
          {job.error ? (
            <p style={{ fontSize: 11, color: "var(--fm-red)", marginTop: 8, whiteSpace: "pre-wrap" }}>
              {String(job.error).slice(0, 400)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
