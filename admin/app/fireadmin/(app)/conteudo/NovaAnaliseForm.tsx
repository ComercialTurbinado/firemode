"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/** Dispara pipeline por URL (site novo ou refresh se domínio já existe). */
export default function NovaAnaliseForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [modo, setModo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    const site = url.trim();
    if (!site) {
      setErro("Informe o site.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/conteudo/presenca/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: site,
          cliente_handle: handle.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Falha ao iniciar");
      setJobId(data.job_id);
      setModo(data.modo);
      // poll leve até ter analise_web_id
      const id = data.job_id as string;
      for (let i = 0; i < 90; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const st = await fetch(`/api/conteudo/presenca/pipeline/${id}`, {
          cache: "no-store",
        });
        if (!st.ok) continue;
        const job = await st.json();
        const analiseId =
          job.analise_web_id || job.result?.analise_web_id || null;
        if (job.status === "done" && analiseId) {
          router.push(`/fireadmin/conteudo/${analiseId}`);
          router.refresh();
          return;
        }
        if (job.status === "error") {
          throw new Error(job.error || "Pipeline falhou");
        }
        // se já resolveu o id, pode ir olhando a análise enquanto roda
        if (analiseId && i >= 2) {
          router.push(`/fireadmin/conteudo/${analiseId}`);
          return;
        }
      }
      setErro("Ainda rodando em background — atualize a lista em breve.");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "flex-end",
        padding: "14px 16px",
        background: "var(--fm-card)",
        border: "1px solid var(--fm-border)",
        borderRadius: 10,
      }}
    >
      <div style={{ flex: "1 1 220px" }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fm-muted)", display: "block", marginBottom: 4 }}>
          Site (nova análise ou refresh)
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="empresa.com.br"
          disabled={loading}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid var(--fm-border)",
            background: "var(--fm-inset)",
            color: "var(--fm-text)",
            fontSize: 13,
          }}
        />
      </div>
      <div style={{ flex: "0 1 140px" }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fm-muted)", display: "block", marginBottom: 4 }}>
          @handle (opc.)
        </label>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="cliente"
          disabled={loading}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid var(--fm-border)",
            background: "var(--fm-inset)",
            color: "var(--fm-text)",
            fontSize: 13,
          }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "8px 14px",
          borderRadius: 8,
          border: "1px solid var(--fm-border)",
          background: "var(--fm-accent)",
          color: "#fff",
          fontWeight: 650,
          fontSize: 13,
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Rodando sequência…" : "Rodar sequência"}
      </button>
      {jobId ? (
        <p style={{ width: "100%", fontSize: 12, color: "var(--fm-muted)", margin: 0 }}>
          Job {jobId}
          {modo ? ` · modo ${modo}` : ""} — IA, redes, rivais, posicionamento, percepção, impacto…
        </p>
      ) : null}
      {erro ? (
        <p style={{ width: "100%", fontSize: 12, color: "var(--fm-red)", margin: 0 }}>{erro}</p>
      ) : null}
    </form>
  );
}
