import Link from "next/link";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const BACKEND = process.env.RADAR_BACKEND_URL ?? "";

const TIPO_LABEL: Record<string, string> = {
  misto: "Misto",
  mista: "Misto",
  proprio: "Próprio",
  concorrente: "Concorrente",
};

const STATUS_COLOR: Record<string, string> = {
  pendente: "#eab308",
  processando: "#3b82f6",
  concluido: "#22c55e",
  erro: "#ef4444",
};

function Badge({ status }: { status: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
      background: `${STATUS_COLOR[status] ?? "#6b7280"}18`,
      color: STATUS_COLOR[status] ?? "#6b7280",
      letterSpacing: "0.04em", textTransform: "uppercase",
    }}>
      {status}
    </span>
  );
}

function fmt(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function AnalisesPage() {
  const supabase = await createClient();

  const [{ data: emAndamento }, { data: concluidas }] = await Promise.all([
    supabase
      .from("solicitacoes_auditoria")
      .select("id, cliente_handle, handle_principal, tipo_auditoria, status, criado_em")
      .in("status", ["pendente", "processando"])
      .order("criado_em", { ascending: false }),
    supabase
      .from("analises")
      .select("id, cliente_handle, handle_auditado, tipo_auditoria, status_auditoria, nicho, criado_em")
      .order("criado_em", { ascending: false })
      .limit(60),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Análises</h1>
        <p style={{ color: "var(--fm-muted)", marginTop: 4, fontSize: 13 }}>
          {emAndamento?.length ?? 0} em andamento · {concluidas?.length ?? 0} concluídas
        </p>
      </div>

      {/* Em andamento */}
      <section>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--fm-yellow)", letterSpacing: "0.06em", marginBottom: 12 }}>
          EM ANDAMENTO
        </h2>
        {!emAndamento?.length ? (
          <div style={{
            background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
            borderRadius: 12, padding: "32px 24px", textAlign: "center", color: "var(--fm-muted)", fontSize: 13,
          }}>
            Nenhuma análise em fila no momento.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {emAndamento.map((s) => (
              <div key={s.id} style={{
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                borderRadius: 10, padding: "14px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>@{s.handle_principal}</p>
                    <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 2 }}>
                      cliente: {s.cliente_handle} · {TIPO_LABEL[s.tipo_auditoria] ?? s.tipo_auditoria}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>{fmt(s.criado_em)}</p>
                  <Badge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Concluídas */}
      <section>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--fm-muted)", letterSpacing: "0.06em", marginBottom: 12 }}>
          CONCLUÍDAS
        </h2>
        {!concluidas?.length ? (
          <div style={{
            background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
            borderRadius: 12, padding: "32px 24px", textAlign: "center", color: "var(--fm-muted)", fontSize: 13,
          }}>
            Nenhuma análise concluída ainda.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {concluidas.map((a) => (
              <div key={a.id} style={{
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                borderRadius: 10, padding: "14px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>@{a.handle_auditado}</p>
                      <span style={{ fontSize: 11, color: "var(--fm-muted)", background: "var(--fm-hover)", padding: "2px 8px", borderRadius: 4 }}>
                        {TIPO_LABEL[a.tipo_auditoria] ?? a.tipo_auditoria}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 2 }}>
                      cliente:{" "}
                      <Link href={`/fireadmin/clientes/${a.cliente_handle}`} style={{ color: "var(--fm-accent)", textDecoration: "none" }}>
                        {a.cliente_handle}
                      </Link>
                      {a.nicho ? ` · ${a.nicho}` : ""}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>{fmt(a.criado_em)}</p>
                  <Badge status={a.status_auditoria ?? "concluido"} />
                  {BACKEND && (
                    <a
                      href={`${BACKEND}/dashboard?handle=${a.cliente_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 6,
                        background: "var(--fm-accent-soft)", color: "var(--fm-accent)",
                        textDecoration: "none", whiteSpace: "nowrap",
                      }}
                    >
                      Abrir relatório ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
