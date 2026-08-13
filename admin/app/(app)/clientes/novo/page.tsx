import Link from "next/link";
import { createCliente } from "../actions";
import { Field, TextInput, SelectInput, SubmitButton, ErrorBanner, Card } from "@/components/AdminForm";

export default async function NovoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
      <div>
        <Link href="/clientes" style={{ color: "var(--fm-muted)", fontSize: 13, textDecoration: "none" }}>
          ← Clientes
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 8 }}>Novo cliente</h1>
      </div>

      <Card>
        <form action={createCliente} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ErrorBanner message={error} />

          <Field label="Handle (@instagram, sem espaços) *">
            <TextInput name="handle" required placeholder="nomedocliente" />
          </Field>
          <Field label="Nome completo">
            <TextInput name="nome_completo" placeholder="Nome do cliente" />
          </Field>
          <Field label="WhatsApp">
            <TextInput name="whatsapp" placeholder="+55 11 90000-0000" />
          </Field>
          <Field label="Email">
            <TextInput name="email" type="email" placeholder="cliente@email.com" />
          </Field>
          <Field label="Nicho">
            <TextInput name="nicho" placeholder="fitness, moda, etc." />
          </Field>
          <Field label="Plano inicial">
            <SelectInput name="plano" defaultValue="free">
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="agency">Agency</option>
            </SelectInput>
          </Field>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <SubmitButton>Criar cliente</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
