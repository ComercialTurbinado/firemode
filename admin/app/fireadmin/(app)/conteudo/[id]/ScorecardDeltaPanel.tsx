"use client";

import type { ScorecardDelta, ScorecardSnapshot } from "@/lib/presenca-scorecard-delta";
import { labelCanalScore } from "@/lib/presenca-scorecard-delta";
import { Card } from "@/components/AdminForm";

function deltaColor(d: number | null | undefined) {
  if (d == null || d === 0) return "var(--fm-muted)";
  if (d > 0) return "var(--fm-green)";
  return "var(--fm-red)";
}

function fmtDelta(d: number | null | undefined) {
  if (d == null) return "—";
  if (d > 0) return `+${d}`;
  return String(d);
}

function CanalList({
  title,
  color,
  rows,
}: {
  title: string;
  color: string;
  rows: { id: string; antes?: number; depois?: number; delta?: number }[];
}) {
  if (!rows.length) return null;
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
        {title} ({rows.length})
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map((r) => (
          <div
            key={r.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 13,
              padding: "6px 0",
              borderBottom: "1px solid var(--fm-border)",
            }}
          >
            <span>{labelCanalScore(r.id)}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", color: deltaColor(r.delta) }}>
              {r.antes != null && r.depois != null
                ? `${r.antes} → ${r.depois} (${fmtDelta(r.delta)})`
                : r.depois != null
                  ? `novo · ${r.depois}`
                  : r.antes != null
                    ? `sumiu · era ${r.antes}`
                    : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScorecardDeltaPanel({
  delta,
  historico,
}: {
  delta?: ScorecardDelta | null;
  historico?: ScorecardSnapshot[] | null;
}) {
  const d = delta ?? (historico?.[0]?.delta as ScorecardDelta | undefined) ?? null;
  if (!d || (!d.melhorou?.length && !d.piorou?.length && !d.novo?.length && !d.sumiu?.length && d.geral_delta == null)) {
    return (
      <Card>
        <h2 style={{ fontWeight: 700, fontSize: 14 }}>Evolução vs última verificação</h2>
        <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 6 }}>
          Ainda sem comparação. Rode o pipeline (ou o cron 7/15/30d) para gerar o primeiro delta.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 14 }}>Evolução vs última verificação</h2>
          <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 4 }}>
            O que melhorou, piorou ou mudou no scorecard
            {d.em ? ` · ${new Date(d.em).toLocaleString("pt-BR")}` : ""}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{
            fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
            color: deltaColor(d.geral_delta), fontVariantNumeric: "tabular-nums",
          }}>
            {fmtDelta(d.geral_delta)}
          </p>
          <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
            geral {d.geral_antes ?? "—"} → {d.geral_depois ?? "—"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <CanalList title="Melhorou" color="var(--fm-green)" rows={d.melhorou ?? []} />
        <CanalList title="Piorou" color="var(--fm-red)" rows={d.piorou ?? []} />
        <CanalList title="Novo" color="var(--fm-blue)" rows={d.novo ?? []} />
        <CanalList title="Sumiu" color="var(--fm-muted)" rows={d.sumiu ?? []} />
      </div>

      {Array.isArray(historico) && historico.length > 1 ? (
        <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 14 }}>
          Histórico: {historico.length} fotos de scorecard salvas.
        </p>
      ) : null}
    </Card>
  );
}
