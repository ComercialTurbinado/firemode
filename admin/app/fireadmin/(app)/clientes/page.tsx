import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { createTeleprompterClient } from "@/lib/teleprompter";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const supabase = await createClient();

  const { data: clientes } = await supabase
    .from("clientes")
    .select("handle, nome_completo, whatsapp, plano, status, criado_em")
    .order("criado_em", { ascending: false });

  const handles = (clientes ?? []).map((c) => c.handle);

  let sessionsByHandle: Record<string, { sessions: number; recordings: number }> = {};

  if (handles.length) {
    const teleprompter = await createTeleprompterClient();
    const { data: tpClients } = await teleprompter
      .from("clients")
      .select("id, external_ref")
      .in("external_ref", handles);

    const handleByClientId = new Map((tpClients ?? []).map((c) => [c.id, c.external_ref as string]));
    const clientIds = [...handleByClientId.keys()];

    if (clientIds.length) {
      const { data: sessions } = await teleprompter
        .from("sessions")
        .select("id, client_id, recordings(id)")
        .in("client_id", clientIds);

      sessionsByHandle = (sessions ?? []).reduce<Record<string, { sessions: number; recordings: number }>>((acc, s) => {
        const handle = handleByClientId.get(s.client_id as string);
        if (!handle) return acc;
        if (!acc[handle]) acc[handle] = { sessions: 0, recordings: 0 };
        acc[handle].sessions += 1;
        acc[handle].recordings += (s.recordings as { id: string }[] | null)?.length ?? 0;
        return acc;
      }, {});
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Clientes</h1>
          <p style={{ color: "var(--fm-muted)", marginTop: 4, fontSize: 13 }}>
            {clientes?.length ?? 0} clientes cadastrados
          </p>
        </div>
        <Link href="/fireadmin/clientes/novo" style={{
          padding: "10px 18px", borderRadius: 8, background: "var(--fm-accent)",
          color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
        }}>
          + Novo cliente
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {!clientes?.length ? (
          <p style={{ color: "var(--fm-muted)" }}>Nenhum cliente ainda.</p>
        ) : clientes.map((c) => {
          const stats = sessionsByHandle[c.handle] ?? { sessions: 0, recordings: 0 };
          return (
            <Link
              key={c.handle}
              href={`/fireadmin/clientes/${encodeURIComponent(c.handle)}`}
              className="transition-colors hover:border-white/15"
              style={{
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                borderRadius: 12, padding: 18, textDecoration: "none", color: "inherit",
                display: "flex", flexDirection: "column", gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", background: "var(--fm-accent-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, color: "var(--fm-accent)", fontSize: 15, flexShrink: 0,
                }}>
                  {(c.nome_completo ?? c.handle ?? "?")[0].toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.nome_completo ?? c.handle}
                  </p>
                  <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    @{c.handle}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: "1px solid var(--fm-border)" }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16 }}>{stats.sessions}</p>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>sessões</p>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16 }}>{stats.recordings}</p>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>gravações</p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                  background: "var(--fm-accent-soft)", color: "var(--fm-accent)", textTransform: "capitalize",
                }}>
                  {c.plano} · {c.status}
                </span>
                <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
                  {new Date(c.criado_em).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
