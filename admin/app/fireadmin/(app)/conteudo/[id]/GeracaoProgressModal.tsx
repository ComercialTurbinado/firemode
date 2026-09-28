"use client";

import { useEffect, useState } from "react";
import type { JobStatus, JobStep } from "@/lib/content-machine";

export type JobAtivo = {
  jobId: string;
  pautaId: string;
  titulo: string;
  analiseId: string;
};

const STORAGE_KEY = "fm-conteudo-job-ativo";

export function salvarJobAtivo(job: JobAtivo) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
  } catch { /* ignore */ }
}

export function lerJobAtivo(analiseId: string): JobAtivo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const job = JSON.parse(raw) as JobAtivo;
    if (job.analiseId !== analiseId) return null;
    return job;
  } catch {
    return null;
  }
}

export function limparJobAtivo() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

function StepIcon({ status }: { status: string }) {
  if (status === "done") {
    return <span style={{ color: "var(--fm-green)", fontWeight: 700, fontSize: 13 }}>✓</span>;
  }
  if (status === "error") {
    return <span style={{ color: "var(--fm-red)", fontWeight: 700, fontSize: 13 }}>✕</span>;
  }
  if (status === "running") {
    return (
      <span style={{
        width: 12, height: 12, borderRadius: "50%",
        border: "2px solid var(--fm-border)", borderTopColor: "var(--fm-accent)",
        display: "inline-block", animation: "fm-spin 0.7s linear infinite",
      }} />
    );
  }
  return (
    <span style={{
      width: 8, height: 8, borderRadius: "50%",
      border: "1.5px solid var(--fm-border)", display: "inline-block",
    }} />
  );
}

function StepRow({ step }: { step: JobStep }) {
  const color =
    step.status === "running" ? "var(--fm-accent)"
      : step.status === "done" ? "var(--fm-text)"
        : step.status === "error" ? "var(--fm-red)"
          : "var(--fm-muted)";

  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      padding: "10px 0", borderTop: "1px solid var(--fm-border)",
    }}>
      <div style={{ width: 16, display: "grid", placeItems: "center", marginTop: 2, flexShrink: 0 }}>
        <StepIcon status={step.status} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13,
          fontWeight: step.status === "running" ? 700 : 500,
          color,
        }}>
          {step.label}
          {step.modelo ? (
            <span style={{
              marginLeft: 8, fontSize: 10, fontWeight: 400, color: "var(--fm-muted)",
              background: "var(--fm-inset)", border: "1px solid var(--fm-border)",
              padding: "1px 6px", borderRadius: 4,
            }}>
              {step.modelo}
            </span>
          ) : null}
        </p>
        <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2 }}>
          {step.status === "pending" && (step.descricao || "Aguardando…")}
          {step.status === "running" && (step.detail || step.descricao || "Em andamento…")}
          {step.status === "done" && (step.detail || "Concluído")}
          {step.status === "error" && (step.detail || "Falhou")}
        </p>
      </div>
      {step.secs != null && (
        <span style={{ fontSize: 11, color: "var(--fm-muted)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
          {step.secs}s
        </span>
      )}
    </div>
  );
}

export default function GeracaoProgressModal({
  jobAtivo,
  onClose,
  onDone,
}: {
  jobAtivo: JobAtivo;
  onClose: () => void;
  onDone: () => void;
}) {
  const [job, setJob] = useState<JobStatus | null>(null);
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      try {
        const res = await fetch(`/api/conteudo/job/${jobAtivo.jobId}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setErroLocal(data.error || "Job indisponível (Content Machine pode ter reiniciado)");
          limparJobAtivo();
          return;
        }

        setJob(data);
        setErroLocal(null);

        if (data.status === "done") {
          limparJobAtivo();
          return;
        }
        if (data.status === "error") {
          limparJobAtivo();
          return;
        }

        timer = setTimeout(poll, 1500);
      } catch (e) {
        if (cancelled) return;
        setErroLocal(e instanceof Error ? e.message : "Falha ao consultar progresso");
        timer = setTimeout(poll, 3000);
      }
    }

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobAtivo.jobId]);

  const steps = job?.steps ?? [];
  const doneCount = steps.filter((s) => s.status === "done").length;
  const total = steps.length || 6;
  const pct = job?.status === "done" ? 100 : Math.round((doneCount / total) * 100);
  const isDone = job?.status === "done";
  const isError = job?.status === "error" || !!erroLocal;
  const erroMsg = erroLocal || (typeof job?.error === "string" ? job.error.split("\n")[0] : null);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Progresso da geração"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
          borderRadius: 14, padding: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Gerando conteúdo
            </p>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 4, lineHeight: 1.35 }}>
              {jobAtivo.titulo}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "var(--fm-muted)",
              cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4,
            }}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div style={{
          height: 4, background: "var(--fm-inset)", borderRadius: 4, overflow: "hidden", marginBottom: 8,
        }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: isError ? "var(--fm-red)" : isDone ? "var(--fm-green)" : "var(--fm-accent)",
            borderRadius: 4, transition: "width 0.4s ease",
          }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--fm-muted)", marginBottom: 12, fontVariantNumeric: "tabular-nums" }}>
          {isDone ? "Concluído" : isError ? "Erro" : `Etapa ${Math.min(doneCount + 1, total)} de ${total}`}
          {" · "}
          job {jobAtivo.jobId}
        </p>

        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {steps.length ? steps.map((s) => <StepRow key={s.key} step={s} />) : (
            <p style={{ color: "var(--fm-muted)", fontSize: 13, padding: "16px 0" }}>
              Conectando ao Content Machine…
            </p>
          )}
        </div>

        {erroMsg && (
          <p style={{
            marginTop: 14, fontSize: 12, color: "var(--fm-red)",
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 8, padding: "10px 12px", lineHeight: 1.45,
          }}>
            {erroMsg}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          {!isDone && !isError && (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: "transparent", border: "1px solid var(--fm-border)",
                color: "var(--fm-muted)", cursor: "pointer",
              }}
            >
              Minimizar
            </button>
          )}
          {(isDone || isError) && (
            <button
              type="button"
              onClick={() => {
                limparJobAtivo();
                if (isDone) onDone();
                else onClose();
              }}
              style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: isDone ? "var(--fm-accent)" : "transparent",
                border: isDone ? "none" : "1px solid var(--fm-border)",
                color: isDone ? "#fff" : "var(--fm-muted)",
                cursor: "pointer",
              }}
            >
              {isDone ? "Ver resultado" : "Fechar"}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fm-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
