import Link from "next/link";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function FeaturesPage() {
  const supabase = createClient();
  const { data: features } = await supabase
    .from("features_creditos")
    .select("slug, nome, custo_creditos, categoria, ativo")
    .order("categoria", { ascending: true });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <Link href="/planos" style={{ color: "var(--fm-muted)", fontSize: 13, textDecoration: "none" }}>
            ← Planos
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 8 }}>Features de crédito</h1>
          <p style={{ color: "var(--fm-muted)", marginTop: 4, fontSize: 13 }}>
            {features?.length ?? 0} features cadastradas
          </p>
        </div>
        <Link href="/planos/features/novo" style={{
          padding: "10px 18px", borderRadius: 8, background: "var(--fm-accent)",
          color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
        }}>
          + Nova feature
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {!features?.length ? (
          <p style={{ color: "var(--fm-muted)" }}>Nenhuma feature ainda.</p>
        ) : features.map((f) => (
          <Link
            key={f.slug}
            href={`/planos/features/${encodeURIComponent(f.slug)}`}
            className="transition-colors hover:border-white/15"
            style={{
              background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
              borderRadius: 12, padding: "18px 24px", textDecoration: "none", color: "inherit",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              opacity: f.ativo ? 1 : 0.5,
            }}
          >
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{f.nome}</p>
              <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 2 }}>
                {f.slug}{f.categoria ? ` · ${f.categoria}` : ""}{!f.ativo ? " · inativa" : ""}
              </p>
            </div>
            <p style={{ fontWeight: 700, fontSize: 16 }}>{f.custo_creditos} créditos</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
