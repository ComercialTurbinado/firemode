import Link from "next/link";
import { createPlano } from "../actions";
import { Field, TextInput, TextArea, SubmitButton, ErrorBanner, Card } from "@/components/AdminForm";

export default async function NovoPlanoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
      <div>
        <Link href="/planos" style={{ color: "var(--fm-muted)", fontSize: 13, textDecoration: "none" }}>
          ← Planos
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 8 }}>Novo plano</h1>
      </div>

      <Card>
        <form action={createPlano} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ErrorBanner message={error} />

          <Field label="Slug (identificador único) *">
            <TextInput name="slug" required placeholder="pro" />
          </Field>
          <Field label="Nome">
            <TextInput name="nome" placeholder="Pro" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Preço mensal (R$)">
              <TextInput name="preco_mensal" type="number" step="0.01" placeholder="97.00" />
            </Field>
            <Field label="Créditos por mês">
              <TextInput name="creditos_mes" type="number" placeholder="200" />
            </Field>
            <Field label="Preço crédito extra (R$)">
              <TextInput name="preco_credito_extra" type="number" step="0.01" placeholder="1.50" />
            </Field>
            <Field label="Máx. contas">
              <TextInput name="max_contas" type="number" defaultValue={1} />
            </Field>
          </div>
          <Field label="Descrição">
            <TextArea name="descricao" rows={3} placeholder="Descrição do plano" />
          </Field>

          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fm-muted)" }}>
              <input type="checkbox" name="edicao_video" /> Edição de vídeo
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fm-muted)" }}>
              <input type="checkbox" name="relatorio_mensal" /> Relatório mensal
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fm-muted)" }}>
              <input type="checkbox" name="alertas_diarios" defaultChecked /> Alertas diários
            </label>
          </div>

          <div style={{ marginTop: 8 }}>
            <SubmitButton>Criar plano</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
