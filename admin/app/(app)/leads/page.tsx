import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { deleteLead, convertLeadToCliente } from "./actions";
import { TextInput, ErrorBanner } from "@/components/AdminForm";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("id, nome, empresa, whatsapp, instagram, cupom_utilizado, created_at")
    .order("created_at", { ascending: false });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Leads</h1>
          <p style={{ color: "var(--fm-muted)", marginTop: 4, fontSize: 13 }}>
            {leads?.length ?? 0} leads capturados
          </p>
        </div>
        <Link href="/leads/novo" style={{
          padding: "10px 18px", borderRadius: 8, background: "var(--fm-accent)",
          color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
        }}>
          + Novo lead
        </Link>
      </div>

      <ErrorBanner message={error} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {!leads?.length ? (
          <p style={{ color: "var(--fm-muted)" }}>Nenhum lead ainda.</p>
        ) : leads.map((lead) => {
          const convertWithId = convertLeadToCliente.bind(null, lead.id);
          const deleteWithId = deleteLead.bind(null, lead.id);
          return (
            <div
              key={lead.id}
              className="transition-colors hover:border-white/15"
              style={{
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                borderRadius: 12, padding: "18px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{lead.nome}</p>
                <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 2 }}>
                  {lead.empresa ? `${lead.empresa} · ` : ""}{lead.whatsapp ?? ""}{lead.instagram ? ` · @${lead.instagram}` : ""}
                  {lead.cupom_utilizado ? ` · cupom ${lead.cupom_utilizado}` : ""}
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <form action={convertWithId} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <TextInput
                    name="handle"
                    placeholder="handle do cliente"
                    defaultValue={lead.instagram ?? ""}
                    style={{ width: 160, padding: "8px 12px", fontSize: 13 }}
                  />
                  <button type="submit" style={{
                    padding: "8px 14px", borderRadius: 8, background: "var(--fm-green)",
                    color: "#fff", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", whiteSpace: "nowrap",
                  }}>
                    Converter em cliente
                  </button>
                </form>
                <form action={deleteWithId}>
                  <button type="submit" style={{
                    padding: "8px 14px", borderRadius: 8, background: "rgba(239,68,68,0.12)",
                    color: "var(--fm-red)", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer",
                  }}>
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
