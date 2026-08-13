import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { updatePlano } from "../actions";
import { Field, TextInput, TextArea, SubmitButton, ErrorBanner, Card } from "@/components/AdminForm";

export const dynamic = "force-dynamic";

export default async function PlanoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const supabase = createClient();

  const { data: plano } = await supabase.from("planos").select("*").eq("slug", slug).maybeSingle();
  if (!plano) notFound();

  const updatePlanoWithSlug = updatePlano.bind(null, slug);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
      <div>
        <Link href="/planos" style={{ color: "var(--fm-muted)", fontSize: 13, textDecoration: "none" }}>
          ← Planos
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 8 }}>{plano.nome}</h1>
        <p style={{ color: "var(--fm-muted)", marginTop: 4, fontSize: 13 }}>{plano.slug}</p>
      </div>

      <Card>
        <form action={updatePlanoWithSlug} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ErrorBanner message={error} />

          <Field label="Nome">
            <TextInput name="nome" defaultValue={plano.nome} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Preço mensal (R$)">
              <TextInput name="preco_mensal" type="number" step="0.01" defaultValue={plano.preco_mensal} />
            </Field>
            <Field label="Créditos por mês">
              <TextInput name="creditos_mes" type="number" defaultValue={plano.creditos_mes} />
            </Field>
            <Field label="Preço crédito extra (R$)">
              <TextInput name="preco_credito_extra" type="number" step="0.01" defaultValue={plano.preco_credito_extra ?? 0} />
            </Field>
            <Field label="Máx. contas">
              <TextInput name="max_contas" type="number" defaultValue={plano.max_contas ?? 1} />
            </Field>
          </div>
          <Field label="Descrição">
            <TextArea name="descricao" rows={3} defaultValue={plano.descricao ?? ""} />
          </Field>

          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fm-muted)" }}>
              <input type="checkbox" name="edicao_video" defaultChecked={plano.edicao_video} /> Edição de vídeo
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fm-muted)" }}>
              <input type="checkbox" name="relatorio_mensal" defaultChecked={plano.relatorio_mensal} /> Relatório mensal
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fm-muted)" }}>
              <input type="checkbox" name="alertas_diarios" defaultChecked={plano.alertas_diarios} /> Alertas diários
            </label>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fm-muted)" }}>
            <input type="checkbox" name="ativo" defaultChecked={plano.ativo} /> Plano ativo (visível para novos clientes)
          </label>

          <div style={{ marginTop: 8 }}>
            <SubmitButton>Salvar alterações</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
