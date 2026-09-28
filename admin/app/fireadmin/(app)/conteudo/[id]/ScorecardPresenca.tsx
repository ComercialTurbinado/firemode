import { Card } from "@/components/AdminForm";
import type { CanalScore, CanalStatus } from "@/lib/presenca-scorecard";

const STATUS_STYLE: Record<CanalStatus, { bg: string; color: string; label: string }> = {
  ok: { bg: "rgba(21,128,61,0.12)", color: "var(--fm-green)", label: "ok" },
  atencao: { bg: "rgba(161,98,7,0.12)", color: "var(--fm-yellow)", label: "atenção" },
  critico: { bg: "rgba(220,38,38,0.12)", color: "var(--fm-red)", label: "crítico" },
  pendente: { bg: "var(--fm-inset)", color: "var(--fm-muted)", label: "pendente" },
  em_breve: { bg: "rgba(37,99,235,0.12)", color: "var(--fm-blue)", label: "em breve" },
};

function notaColor(n: number | null) {
  if (n == null) return "var(--fm-muted)";
  if (n >= 75) return "var(--fm-green)";
  if (n >= 50) return "var(--fm-yellow)";
  return "var(--fm-red)";
}

export default function ScorecardPresenca({
  geral,
  canais,
}: {
  geral: number | null;
  canais: CanalScore[];
}) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 14 }}>Scorecard de presença</h2>
          <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 4 }}>
            Nota interna por canal · piores primeiro · fluxo de análise: Site → Busca → GMB → Ads → redes
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{
            fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em",
            color: notaColor(geral), fontVariantNumeric: "tabular-nums", lineHeight: 1,
          }}>
            {geral != null ? geral : "—"}
          </p>
          <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4 }}>nota geral</p>
        </div>
      </div>

      <div className="scorecard-grid">
        {canais.map((c) => {
          const st = STATUS_STYLE[c.status];
          const inner = (
            <div className="scorecard-cell">
              <p style={{ fontWeight: 700, fontSize: 13 }}>{c.label}</p>
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                padding: "2px 7px", borderRadius: 20, background: st.bg, color: st.color,
                justifySelf: "end",
              }}>
                {st.label}
              </span>
              <p style={{
                fontSize: 22, fontWeight: 800, fontVariantNumeric: "tabular-nums",
                color: notaColor(c.nota), letterSpacing: "-0.02em",
                gridColumn: "1 / -1",
              }}>
                {c.nota != null ? c.nota : "—"}
              </p>
              <p style={{ fontSize: 11, color: "var(--fm-muted)", lineHeight: 1.4, gridColumn: "1 / -1" }}>
                {c.detalhe}
              </p>
            </div>
          );

          if (c.href) {
            return (
              <a
                key={c.id}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {inner}
              </a>
            );
          }
          return <div key={c.id}>{inner}</div>;
        })}
      </div>

      <style>{`
        .scorecard-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        .scorecard-cell {
          padding: 12px 14px;
          background: var(--fm-inset);
          border-radius: 10px;
          border: 1px solid var(--fm-border);
          height: 100%;
          display: grid;
          grid-template-columns: 1fr auto;
          grid-template-rows: auto auto auto;
          column-gap: 10px;
          row-gap: 6px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .scorecard-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .scorecard-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </Card>
  );
}
