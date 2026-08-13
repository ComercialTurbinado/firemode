import { createClient } from "@/lib/supabase";
import { createTeleprompterClient } from "@/lib/teleprompter";
import { fetchPipelineStatus } from "@/lib/bridge";
import { Users, Video, Activity, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number | string; icon: React.ElementType; color: string;
}) {
  return (
    <div
      className="transition-colors hover:border-white/15"
      style={{
        background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
        borderRadius: 12, padding: "20px 24px", display: "flex",
        alignItems: "center", gap: 16,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10, display: "flex",
        alignItems: "center", justifyContent: "center",
        background: `${color}18`,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4 }}>{label}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = createClient();
  const teleprompter = createTeleprompterClient();

  const [
    { count: totalClients },
    { count: totalSessions },
    { data: recentSessions },
    jobs,
  ] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    teleprompter.from("sessions").select("*", { count: "exact", head: true }),
    teleprompter.from("sessions")
      .select("id, title, created_at, recordings(id)")
      .order("created_at", { ascending: false })
      .limit(5),
    fetchPipelineStatus(),
  ]);

  const activeJobs = jobs.filter(j => j.completedParts < j.totalParts).length;
  const completedToday = jobs.filter(j => j.completedParts === j.totalParts).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Dashboard</h1>
        <p style={{ color: "var(--fm-muted)", marginTop: 4, fontSize: 13 }}>Visão geral da plataforma</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard label="Clientes" value={totalClients ?? 0} icon={Users} color="#3b82f6" />
        <StatCard label="Sessões criadas" value={totalSessions ?? 0} icon={Video} color="#f97316" />
        <StatCard label="Jobs ativos" value={activeJobs} icon={Activity} color="#eab308" />
        <StatCard label="Concluídos hoje" value={completedToday} icon={CheckCircle} color="#22c55e" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "var(--fm-surface)", border: "1px solid var(--fm-border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: 14 }}>Sessões recentes</h2>
          {recentSessions?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentSessions.map((s) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{s.title || "Sem título"}</p>
                    <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2 }}>
                      {new Date(s.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                    background: "rgba(249,115,22,0.12)", color: "#f97316",
                  }}>
                    {(s.recordings as { id: string }[] | null)?.length ?? 0} partes
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>Nenhuma sessão ainda.</p>
          )}
        </div>

        <div style={{ background: "var(--fm-surface)", border: "1px solid var(--fm-border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: 14 }}>Pipeline agora</h2>
          {jobs.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {jobs.slice(0, 5).map((job) => (
                <div key={job.recordId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 12, fontFamily: "monospace", color: "var(--fm-muted)" }}>
                    {job.recordId.slice(0, 24)}…
                  </p>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                    background: job.completedParts === job.totalParts ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)",
                    color: job.completedParts === job.totalParts ? "#22c55e" : "#eab308",
                  }}>
                    {job.completedParts}/{job.totalParts}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>Nenhum job no momento.</p>
          )}
        </div>
      </div>
    </div>
  );
}
