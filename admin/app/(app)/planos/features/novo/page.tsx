import Link from "next/link";
import { createFeature } from "../actions";
import { Field, TextInput, TextArea, SubmitButton, ErrorBanner, Card } from "@/components/AdminForm";

export default async function NovaFeaturePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
      <div>
        <Link href="/planos/features" style={{ color: "var(--fm-muted)", fontSize: 13, textDecoration: "none" }}>
          ← Features de crédito
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 8 }}>Nova feature</h1>
      </div>

      <Card>
        <form action={createFeature} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ErrorBanner message={error} />

          <Field label="Slug (identificador único) *">
            <TextInput name="slug" required placeholder="edicao_video" />
          </Field>
          <Field label="Nome">
            <TextInput name="nome" placeholder="Edição de Vídeo" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Custo em créditos">
              <TextInput name="custo_creditos" type="number" placeholder="20" />
            </Field>
            <Field label="Categoria">
              <TextInput name="categoria" placeholder="edicao" />
            </Field>
          </div>
          <Field label="Descrição">
            <TextArea name="descricao" rows={3} placeholder="O que essa feature faz" />
          </Field>

          <div style={{ marginTop: 8 }}>
            <SubmitButton>Criar feature</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
