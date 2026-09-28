"use client";

import type { TrilhaConteudo } from "@/lib/trilha-conteudo";

export default function TrilhaConteudoPanel({ trilha }: { trilha: TrilhaConteudo }) {
  return (
    <div style={{
      padding: 14,
      borderRadius: 10,
      border: `1px solid ${trilha.pronto ? "rgba(21,128,61,0.35)" : "var(--fm-border)"}`,
      background: trilha.pronto ? "rgba(21,128,61,0.06)" : "var(--fm-inset)",
      marginBottom: 4,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 13 }}>
            Trilha de conteúdo
          </p>
          <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 3 }}>
            {trilha.pronto
              ? "Pronto para gerar — tom e percepção alinhados."
              : "Complete as etapas obrigatórias antes de criar peças."}
          </p>
        </div>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: trilha.pronto ? "var(--fm-green)" : "var(--fm-yellow)",
          flexShrink: 0,
        }}>
          {trilha.pronto ? "liberado" : "bloqueado"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {trilha.itens.map((item) => (
          <a
            key={item.id}
            href={item.href || "#"}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              padding: "7px 10px",
              borderRadius: 8,
              textDecoration: "none",
              color: "inherit",
              background: "var(--fm-surface)",
              border: "1px solid var(--fm-border)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600 }}>
                {item.ok ? "✓" : "○"}{" "}
                {item.label}
                {item.obrigatorio ? (
                  <span style={{ color: "var(--fm-muted)", fontWeight: 500 }}> · obrigatório</span>
                ) : (
                  <span style={{ color: "var(--fm-muted)", fontWeight: 500 }}> · opcional</span>
                )}
              </p>
              {item.detalhe ? (
                <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2 }}>{item.detalhe}</p>
              ) : null}
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 650,
              color: item.ok ? "var(--fm-green)" : (item.obrigatorio ? "var(--fm-red)" : "var(--fm-muted)"),
            }}>
              {item.ok ? "ok" : "falta"}
            </span>
          </a>
        ))}
      </div>

      {!trilha.pronto && trilha.faltantes.length > 0 ? (
        <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 10, lineHeight: 1.45 }}>
          Falta: {trilha.faltantes.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}
