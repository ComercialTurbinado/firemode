"use client";

import type { EspecialistaBloco as Esp } from "@/lib/especialista";
import { temEspecialista } from "@/lib/especialista";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: 11,
      padding: "2px 7px",
      borderRadius: 5,
      marginRight: 4,
      marginBottom: 4,
      border: "1px solid var(--fm-border)",
      background: "var(--fm-surface)",
      color: "var(--fm-text)",
    }}>
      {children}
    </span>
  );
}

function Col({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid var(--fm-border)",
      background: "var(--fm-inset)",
      minWidth: 0,
    }}>
      <p style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.06em",
        color: "var(--fm-muted)",
        marginBottom: 6,
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

/** Bloco do especialista do canal — comportamento / conteúdo / frequência. */
export default function EspecialistaBlocoView({
  data,
  compact,
}: {
  data?: Esp | null;
  /** Versão mais densa (slide de apresentação). */
  compact?: boolean;
}) {
  if (!temEspecialista(data)) return null;
  const e = data!;
  const comp = e.comportamento;
  const cont = e.conteudo;
  const freq = e.frequencia;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: compact ? 8 : 10,
      padding: compact ? "10px 12px" : "12px 14px",
      borderRadius: 10,
      border: "1px solid var(--fm-border)",
      background: "var(--fm-surface)",
    }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px 12px" }}>
        <p style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.07em",
          color: "var(--fm-accent)",
        }}>
          ESPECIALISTA
        </p>
        {e.papel ? (
          <p style={{ fontSize: compact ? 12 : 13, fontWeight: 600, color: "var(--fm-text)" }}>
            {e.papel}
          </p>
        ) : null}
      </div>

      {e.resumo_especialista ? (
        <p style={{ fontSize: compact ? 13 : 14, lineHeight: 1.45, color: "var(--fm-text)" }}>
          {e.resumo_especialista}
        </p>
      ) : null}

      <div style={{
        display: "grid",
        gridTemplateColumns: compact ? "1fr 1fr 1fr" : "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 8,
      }}>
        <Col title="Comportamento">
          {comp?.diagnostico ? (
            <p style={{ fontSize: 12, lineHeight: 1.4 }}>{comp.diagnostico}</p>
          ) : (
            <p style={{ fontSize: 12, color: "var(--fm-muted)" }}>—</p>
          )}
          {!!comp?.padroes?.length && (
            <div style={{ marginTop: 6 }}>
              {comp.padroes.map((p, i) => <Pill key={i}>{p}</Pill>)}
            </div>
          )}
          {comp?.recomendacao ? (
            <p style={{ fontSize: 12, marginTop: 6, color: "var(--fm-muted)", lineHeight: 1.4 }}>
              → {comp.recomendacao}
            </p>
          ) : null}
        </Col>

        <Col title="Conteúdo">
          {cont?.diagnostico ? (
            <p style={{ fontSize: 12, lineHeight: 1.4 }}>{cont.diagnostico}</p>
          ) : (
            <p style={{ fontSize: 12, color: "var(--fm-muted)" }}>—</p>
          )}
          {!!cont?.formatos?.length && (
            <div style={{ marginTop: 6 }}>
              {cont.formatos.map((p, i) => <Pill key={i}>{p}</Pill>)}
            </div>
          )}
          {cont?.recomendacao ? (
            <p style={{ fontSize: 12, marginTop: 6, color: "var(--fm-muted)", lineHeight: 1.4 }}>
              → {cont.recomendacao}
            </p>
          ) : null}
        </Col>

        <Col title="Frequência">
          <p style={{ fontSize: 12, lineHeight: 1.4 }}>
            <span style={{ color: "var(--fm-muted)" }}>Agora: </span>
            {freq?.atual || "desconhecido"}
          </p>
          <p style={{ fontSize: 12, lineHeight: 1.4, marginTop: 4 }}>
            <span style={{ color: "var(--fm-muted)" }}>Ideal: </span>
            {freq?.ideal || "—"}
          </p>
          {freq?.justificativa ? (
            <p style={{ fontSize: 12, marginTop: 6, color: "var(--fm-muted)", lineHeight: 1.4 }}>
              {freq.justificativa}
            </p>
          ) : null}
          {freq?.cadencia_sugerida ? (
            <p style={{ fontSize: 12, marginTop: 6, lineHeight: 1.4 }}>
              {freq.cadencia_sugerida}
            </p>
          ) : null}
        </Col>
      </div>
    </div>
  );
}
