import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { updateFeature } from "../actions";
import { Field, TextInput, TextArea, SubmitButton, ErrorBanner, Card } from "@/components/AdminForm";

export const dynamic = "force-dynamic";

export default async function FeatureDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const supabase = createClient();

  const { data: feature } = await supabase.from("features_creditos").select("*").eq("slug", slug).maybeSingle();
  if (!feature) notFound();

  const updateFeatureWithSlug = updateFeature.bind(null, slug);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
      <div>
        <Link href="/planos/features" style={{ color: "var(--fm-muted)", fontSize: 13, textDecoration: "none" }}>
          ← Features de crédito
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 8 }}>{feature.nome}</h1>
        <p style={{ color: "var(--fm-muted)", marginTop: 4, fontSize: 13 }}>{feature.slug}</p>
      </div>

      <Card>
        <form action={updateFeatureWithSlug} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ErrorBanner message={error} />

          <Field label="Nome">
            <TextInput name="nome" defaultValue={feature.nome} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Custo em créditos">
              <TextInput name="custo_creditos" type="number" defaultValue={feature.custo_creditos} />
            </Field>
            <Field label="Categoria">
              <TextInput name="categoria" defaultValue={feature.categoria ?? ""} />
            </Field>
          </div>
          <Field label="Descrição">
            <TextArea name="descricao" rows={3} defaultValue={feature.descricao ?? ""} />
          </Field>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fm-muted)" }}>
            <input type="checkbox" name="ativo" defaultChecked={feature.ativo} /> Feature ativa
          </label>

          <div style={{ marginTop: 8 }}>
            <SubmitButton>Salvar alterações</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
