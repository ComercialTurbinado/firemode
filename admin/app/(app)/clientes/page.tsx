import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { createTeleprompterClient } from "@/lib/teleprompter";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const supabase = createClient();

  const { data: clientes } = await supabase
    .from("clientes")
    .select("handle, nome_completo, whatsapp, plano, status, criado_em")
    .order("criado_em", { ascending: false });

  const handles = (clientes ?? []).map((c) => c.handle);

  let sessionsByHandle: Record<string, { sessions: number; recordings: number }> = {};

  if (handles.length) {
    const teleprompter = createTeleprompterClient();
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
        <Link href="/clientes/novo" style={{
          padding: "10px 18px", borderRadius: 8, background: "var(--fm-accent)",
          color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
        }}>
          + Novo cliente
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {!clientes?.length ? (
          <p style={{ color: "var(--fm-muted)" }}>Nenhum cliente ainda.</p>
        ) : clientes.map((c) => {
          const stats = sessionsByHandle[c.handle] ?? { sessions: 0, recordings: 0 };
          return (
            <Link
              key={c.handle}
              href={`/clientes/${encodeURIComponent(c.handle)}`}
              className="transition-colors hover:border-white/15"
              style={{
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                borderRadius: 12, padding: "18px 24px", textDecoration: "none", color: "inherit",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", background: "var(--fm-accent-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, color: "var(--fm-accent)", fontSize: 16, flexShrink: 0,
                }}>
                  {(c.nome_completo ?? c.handle ?? "?")[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{c.nome_completo ?? c.handle}</p>
                  <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 2 }}>
                    {c.whatsapp ?? ""} · @{c.handle}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, fontSize: 18 }}>{stats.sessions}</p>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>sessões</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, fontSize: 18 }}>{stats.recordings}</p>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>gravações</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)", textTransform: "capitalize" }}>{c.plano} · {c.status}</p>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>
                    desde {new Date(c.criado_em).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
