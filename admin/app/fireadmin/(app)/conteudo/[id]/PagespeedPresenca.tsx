"use client";

import { TermoLabel } from "./TermoHint";

export type PagespeedLite = {
  ok?: boolean;
  erro?: string | null;
  performance_mobile?: number | null;
  performance_desktop?: number | null;
  mobile?: {
    scores?: {
      performance?: number | null;
      accessibility?: number | null;
      best_practices?: number | null;
      seo?: number | null;
    };
    metrics?: Record<string, { display?: string; score?: number | null } | undefined>;
    field_data?: { overall?: string } | null;
  };
};

function psiColor(score?: number | null) {
  if (score == null) return "var(--fm-muted)";
  if (score >= 90) return "var(--fm-green)";
  if (score >= 50) return "#eab308";
  return "var(--fm-red)";
}

function Score({ label, glossKey, score }: { label: string; glossKey?: string; score?: number | null }) {
  const lab = glossKey ? <TermoLabel glossKey={glossKey}>{label}</TermoLabel> : label;
  return (
    <div style={{ textAlign: "center", minWidth: 64 }}>
      <p style={{
        fontSize: 26, fontWeight: 800, fontVariantNumeric: "tabular-nums",
        color: psiColor(score), letterSpacing: "-0.03em", lineHeight: 1,
      }}>
        {score != null ? score : "—"}
      </p>
      <p style={{
        fontSize: 10, fontWeight: 600, color: "var(--fm-muted)", marginTop: 6,
        textTransform: "uppercase", letterSpacing: "0.04em",
      }}>
        {lab}
      </p>
    </div>
  );
}

/** Bloco PageSpeed Insights para Site/Tech na apresentação. */
export default function PagespeedPresenca({ data, compact }: { data?: PagespeedLite | null; compact?: boolean }) {
  if (!data) return null;
  if (data.erro && !data.ok && data.performance_mobile == null && data.performance_desktop == null) {
    return (
      <div style={{
        padding: compact ? "10px 12px" : "12px 14px",
        borderRadius: 10,
        border: "1px solid var(--fm-border)",
        background: "var(--fm-inset)",
        fontSize: 13,
        color: "var(--fm-muted)",
      }}>
        PageSpeed Insights indisponível nesta auditoria.
      </div>
    );
  }

  const metrics = data.mobile?.metrics || {};
  const metricKeys = [
    { key: "lcp", label: "LCP", gloss: "lcp" },
    { key: "cls", label: "CLS", gloss: "cls" },
    { key: "tbt", label: "TBT", gloss: "tbt" },
    { key: "fcp", label: "FCP", gloss: "fcp" },
    { key: "speed_index", label: "Speed Index", gloss: "speed index" },
    { key: "tti", label: "TTI", gloss: "tti" },
  ] as const;

  return (
    <div style={{
      padding: compact ? "10px 12px" : "14px 16px",
      borderRadius: 10,
      border: "1px solid var(--fm-border)",
      background: "var(--fm-inset)",
      display: "flex",
      flexDirection: "column",
      gap: compact ? 10 : 14,
    }}>
      <p style={{
        fontSize: 11, fontWeight: 800, letterSpacing: "0.07em",
        color: "var(--fm-accent)", display: "flex", alignItems: "center", gap: 4,
      }}>
        <TermoLabel glossKey="pagespeed insights">PAGESPEED INSIGHTS</TermoLabel>
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? 14 : 20, alignItems: "flex-end" }}>
        <Score label="Mobile" score={data.performance_mobile ?? data.mobile?.scores?.performance} />
        <Score label="Desktop" score={data.performance_desktop} />
        {data.mobile?.scores?.accessibility != null && (
          <Score label="A11y" glossKey="a11y" score={data.mobile.scores.accessibility} />
        )}
        {data.mobile?.scores?.best_practices != null && (
          <Score label="Best practices" glossKey="best practices" score={data.mobile.scores.best_practices} />
        )}
        {data.mobile?.scores?.seo != null && (
          <Score label="SEO lab" score={data.mobile.scores.seo} />
        )}
      </div>

      {metricKeys.some((m) => metrics[m.key]?.display) ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {metricKeys.map(({ key, label, gloss }) => {
            const m = metrics[key];
            if (!m?.display) return null;
            return (
              <span key={key} style={{
                fontSize: 12, color: "var(--fm-muted)",
                background: "var(--fm-surface)",
                border: "1px solid var(--fm-border)",
                borderRadius: 6, padding: "5px 9px",
                display: "inline-flex", alignItems: "center", gap: 2,
              }}>
                <TermoLabel glossKey={gloss}>{label}</TermoLabel>
                {": "}
                <b style={{ color: psiColor(m.score) }}>{m.display}</b>
              </span>
            );
          })}
        </div>
      ) : null}

      {data.mobile?.field_data?.overall ? (
        <p style={{ fontSize: 12, color: "var(--fm-muted)", lineHeight: 1.4 }}>
          <TermoLabel glossKey="field data">Field data</TermoLabel>
          {" ( "}
          <TermoLabel glossKey="crux">CrUX</TermoLabel>
          {`): ${data.mobile.field_data.overall}`}
        </p>
      ) : null}
    </div>
  );
}
