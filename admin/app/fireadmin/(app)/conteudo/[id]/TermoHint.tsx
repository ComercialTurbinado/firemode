"use client";

import { useId, useState } from "react";
import { GLOSSARIO, GLOSSARIO_PADROES, type GlossarioItem } from "@/lib/glossario-presenca";

/** Bolinha (?) com explicação ao passar o mouse / focar / tocar. */
export function TermoHint({ item, inline }: { item: GlossarioItem; inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const tipId = useId();

  return (
    <span
      style={{
        position: "relative",
        display: inline ? "inline" : "inline-flex",
        alignItems: "center",
        verticalAlign: "baseline",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-describedby={open ? tipId : undefined}
        aria-label={`O que é ${item.termo}`}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 14,
          height: 14,
          marginLeft: 3,
          marginRight: 1,
          padding: 0,
          borderRadius: "50%",
          border: "1px solid var(--fm-border)",
          background: "var(--fm-inset, transparent)",
          color: "var(--fm-muted)",
          fontSize: 9,
          fontWeight: 800,
          lineHeight: 1,
          cursor: "help",
          verticalAlign: "super",
        }}
      >
        ?
      </button>
      {open ? (
        <span
          id={tipId}
          role="tooltip"
          style={{
            position: "absolute",
            zIndex: 80,
            left: "50%",
            top: "calc(100% + 8px)",
            transform: "translateX(-50%)",
            width: "min(280px, 70vw)",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid var(--fm-border)",
            background: "var(--fm-surface)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            color: "var(--fm-text)",
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.45,
            textAlign: "left",
            pointerEvents: "none",
            whiteSpace: "normal",
          }}
        >
          <span style={{ fontWeight: 700, display: "block", marginBottom: 4, color: "var(--fm-accent)" }}>
            {item.termo}
          </span>
          {item.meaning}
        </span>
      ) : null}
    </span>
  );
}

/** Rótulo + (?) — use em labels fixos (ex.: LCP no PageSpeed). */
export function TermoLabel({
  glossKey,
  children,
}: {
  glossKey: string;
  children: React.ReactNode;
}) {
  const item = GLOSSARIO[glossKey.toLowerCase()];
  if (!item) return <>{children}</>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
      {children}
      <TermoHint item={item} />
    </span>
  );
}

/**
 * Percorre um texto e injeta (?) após termos do glossário (1ª ocorrência de cada chave).
 * Seguro para títulos/resumos da apresentação.
 */
export function TextoComGlossario({
  text,
  as: Tag = "span",
  style,
}: {
  text: string;
  as?: "span" | "p" | "div";
  style?: React.CSSProperties;
}) {
  if (!text) return null;

  type Part = { t: string; key?: string };
  const parts: Part[] = [{ t: text }];
  const usados = new Set<string>();

  for (const { key, re } of GLOSSARIO_PADROES) {
    if (usados.has(key)) continue;
    const next: Part[] = [];
    let achou = false;
    for (const part of parts) {
      if (part.key || achou) {
        next.push(part);
        continue;
      }
      re.lastIndex = 0;
      const m = re.exec(part.t);
      if (!m || m.index == null) {
        next.push(part);
        continue;
      }
      achou = true;
      usados.add(key);
      const prefix = m[1] || "";
      const match = m[2] || m[0];
      const start = m.index;
      const before = part.t.slice(0, start) + prefix;
      const after = part.t.slice(start + prefix.length + match.length);
      if (before) next.push({ t: before });
      next.push({ t: match, key });
      if (after) next.push({ t: after });
    }
    parts.length = 0;
    parts.push(...next);
  }

  return (
    <Tag style={style}>
      {parts.map((p, i) => {
        if (!p.key) return <span key={i}>{p.t}</span>;
        const item = GLOSSARIO[p.key];
        return (
          <span key={i} style={{ whiteSpace: "pre-wrap" }}>
            {p.t}
            {item ? <TermoHint item={item} inline /> : null}
          </span>
        );
      })}
    </Tag>
  );
}
