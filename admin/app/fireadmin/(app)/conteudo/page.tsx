import { createClient } from "@/lib/supabase";
import ConteudoTabs from "./ConteudoTabs";
import NovaAnaliseForm from "./NovaAnaliseForm";

export const dynamic = "force-dynamic";

export default async function ConteudoPage() {
  const supabase = await createClient();

  const [{ data: analises }, { data: pecas }, { data: pautas }] = await Promise.all([
    supabase
      .from("analises_web")
      .select("id, cliente_handle, url, dominio, status, criado_em, diagnostico, etapas")
      .order("criado_em", { ascending: false })
      .limit(80),
    supabase
      .from("pecas_conteudo")
      .select("id, analise_ref, cliente_handle, tipo, status, titulo, palavra_chave, plataforma, angulo, criado_em")
      .eq("origem", "content-machine")
      .order("criado_em", { ascending: false })
      .limit(200),
    supabase
      .from("pautas_seo")
      .select("id, analise_web_id, cliente_handle, titulo, palavra_chave, intencao, dificuldade, prioridade, lacuna, status, criado_em")
      .order("prioridade", { ascending: true })
      .limit(200),
  ]);

  const contagemPorAnalise: Record<string, Record<string, number>> = {};
  for (const p of pecas ?? []) {
    if (!p.analise_ref) continue;
    const c = contagemPorAnalise[p.analise_ref] ?? {};
    c[p.tipo] = (c[p.tipo] ?? 0) + 1;
    contagemPorAnalise[p.analise_ref] = c;
  }

  const totalPecas = (pecas ?? []).length;
  const totalPautas = (pautas ?? []).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Conteúdo</h1>
        <p style={{ color: "var(--fm-muted)", marginTop: 4, fontSize: 13 }}>
          Content Machine · {(analises ?? []).length} análise(s) · {totalPautas} pauta(s) · {totalPecas} peça(s)
        </p>
      </div>

      <NovaAnaliseForm />

      <ConteudoTabs
        analises={analises ?? []}
        pautas={pautas ?? []}
        pecas={pecas ?? []}
        contagemPorAnalise={contagemPorAnalise}
      />
    </div>
  );
}
