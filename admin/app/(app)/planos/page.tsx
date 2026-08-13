import Link from "next/link";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function PlanosPage() {
  const supabase = createClient();
  const { data: planos } = await supabase
    .from("planos")
    .select("slug, nome, preco_mensal, creditos_mes, ativo")
    .order("preco_mensal", { ascending: true });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Planos</h1>
          <p style={{ color: "var(--fm-muted)", marginTop: 4, fontSize: 13 }}>
            {planos?.length ?? 0} planos cadastrados
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/planos/features" style={{
            padding: "10px 18px", borderRadius: 8, border: "1px solid var(--fm-border)",
            color: "var(--fm-text)", fontWeight: 600, fontSize: 14, textDecoration: "none",
          }}>
            Features de crédito
          </Link>
          <Link href="/planos/novo" style={{
            padding: "10px 18px", borderRadius: 8, background: "var(--fm-accent)",
            color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
          }}>
            + Novo plano
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {!planos?.length ? (
          <p style={{ color: "var(--fm-muted)" }}>Nenhum plano ainda.</p>
        ) : planos.map((p) => (
          <Link
            key={p.slug}
            href={`/planos/${encodeURIComponent(p.slug)}`}
            className="transition-colors hover:border-white/15"
            style={{
              background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
              borderRadius: 12, padding: "18px 24px", textDecoration: "none", color: "inherit",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              opacity: p.ativo ? 1 : 0.5,
            }}
          >
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{p.nome}</p>
              <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 2 }}>{p.slug}{!p.ativo ? " · inativo" : ""}</p>
            </div>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: 16 }}>R$ {Number(p.preco_mensal).toFixed(2)}</p>
                <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>por mês</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: 16 }}>{p.creditos_mes}</p>
                <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>créditos/mês</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
