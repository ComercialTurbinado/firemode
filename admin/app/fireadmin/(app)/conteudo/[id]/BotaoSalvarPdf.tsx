"use client";

import { useState } from "react";

/** Salva a LP atual como PDF (mesmo visual da apresentação). */
export default function BotaoSalvarPdf({
  empresa,
  variant = "accent",
}: {
  analiseId?: string | null;
  empresa?: string | null;
  variant?: "accent" | "ghost";
}) {
  const [busy, setBusy] = useState(false);

  const accent = variant === "accent";

  function salvar() {
    setBusy(true);
    const prevTitle = document.title;
    if (empresa) {
      document.title = `${empresa} — Presença Digital · Firemode`;
    }
    document.documentElement.classList.add("fm-printing");

    const done = () => {
      document.documentElement.classList.remove("fm-printing");
      document.title = prevTitle;
      setBusy(false);
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);

    // Garante que o topo entre no PDF; CSS de print força reveals visíveis
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      window.print();
      // Safari às vezes não dispara afterprint
      setTimeout(done, 1500);
    });
  }

  return (
    <button
      type="button"
      onClick={salvar}
      disabled={busy}
      title="Salvar a apresentação com o visual original (PDF)"
      className="fm-no-print"
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        border: accent ? "none" : "1px solid var(--fm-border)",
        background: accent ? "var(--fm-accent)" : "var(--fm-surface)",
        color: accent ? "#fff" : "var(--fm-text)",
        fontWeight: 650,
        fontSize: 13,
        cursor: busy ? "wait" : "pointer",
        opacity: busy ? 0.7 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {busy ? "Abrindo…" : "Salvar PDF"}
    </button>
  );
}
