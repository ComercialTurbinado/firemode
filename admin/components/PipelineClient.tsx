"use client";
import { useEffect, useState, useCallback } from "react";
import type { JobStatus } from "@/lib/bridge";
import { RefreshCw } from "lucide-react";

const STAGES: Record<string, string> = {
  transcribing: "Transcrevendo",
  planning: "Planejando",
  sourcing: "Buscando fontes",
  cutting: "Cortando",
  enhancing: "Enhance",
  generating: "Gerando dados",
  rendering: "Renderizando",
  completed: "Concluído",
  failed: "Erro",
};

const STAGE_COLOR: Record<string, string> = {
  completed: "#22c55e",
  failed: "#ef4444",
  rendering: "#f97316",
  enhancing: "#3b82f6",
  default: "#eab308",
};

function stageColor(stage: string) {
  return STAGE_COLOR[stage] ?? STAGE_COLOR.default;
}

function elapsed(startedAt: string, completedAt?: string) {
  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const secs = Math.round((end - start) / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function JobRow({ job }: { job: JobStatus }) {
  const done = job.completedParts === job.totalParts;
  return (
    <div style={{
      background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
      borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontFamily: "monospace", fontSize: 12, color: "var(--fm-muted)" }}>
            {job.recordId}
          </p>
          <p style={{ marginTop: 4, fontSize: 13, fontWeight: 600 }}>
            {job.completedParts}/{job.totalParts} partes concluídas
          </p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
          background: done ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)",
          color: done ? "#22c55e" : "#eab308",
          letterSpacing: "0.04em",
        }}>
          {done ? "PRONTO" : "EM ANDAMENTO"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {job.parts.map((part) => (
          <div key={part.baseName} style={{
            background: "#0d0d0d", borderRadius: 8, padding: "12px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--fm-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {part.baseName.split("__").pop()}
              </p>
              {part.trilha && (
                <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2 }}>
                  🎵 {part.trilha}
                </p>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: "var(--fm-muted)" }}>
                {elapsed(part.startedAt, part.completedAt)}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6,
                background: `${stageColor(part.stage)}18`,
                color: stageColor(part.stage),
                whiteSpace: "nowrap",
              }}>
                {STAGES[part.stage] ?? part.stage}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PipelineClient({ initialJobs }: { initialJobs: JobStatus[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pipeline-status");
      if (res.ok) {
        setJobs(await res.json());
        setLastUpdate(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(refresh, 8000);
    return () => clearInterval(timer);
  }, [refresh]);

  const active = jobs.filter(j => j.completedParts < j.totalParts);
  const done = jobs.filter(j => j.completedParts === j.totalParts);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Pipeline</h1>
          <p style={{ color: "var(--fm-muted)", marginTop: 4, fontSize: 13 }}>
            {active.length} em andamento · {done.length} concluídos
          </p>
        </div>
        <button onClick={refresh} disabled={loading} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 8, border: "1px solid var(--fm-border)",
          background: "var(--fm-surface)", color: loading ? "var(--fm-muted)" : "var(--fm-text)",
          fontSize: 13, cursor: "pointer",
        }}>
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Atualizar
        </button>
      </div>

      <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
        Atualiza a cada 8s · última: {lastUpdate.toLocaleTimeString("pt-BR")}
      </p>

      {!jobs.length && (
        <div style={{
          background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
          borderRadius: 12, padding: "48px 24px", textAlign: "center", color: "var(--fm-muted)",
        }}>
          Nenhum job no pipeline no momento.
        </div>
      )}

      {active.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "#eab308" }}>Em andamento</h2>
          {active.map(j => <JobRow key={j.recordId} job={j} />)}
        </div>
      )}

      {done.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--fm-muted)" }}>Concluídos</h2>
          {done.map(j => <JobRow key={j.recordId} job={j} />)}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
