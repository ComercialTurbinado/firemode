import Link from "next/link";
import { createLead } from "../actions";
import { Field, TextInput, SubmitButton, ErrorBanner, Card } from "@/components/AdminForm";

export default async function NovoLeadPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
      <div>
        <Link href="/leads" style={{ color: "var(--fm-muted)", fontSize: 13, textDecoration: "none" }}>
          ← Leads
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 8 }}>Novo lead</h1>
      </div>

      <Card>
        <form action={createLead} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ErrorBanner message={error} />

          <Field label="Nome *">
            <TextInput name="nome" required placeholder="Nome do lead" />
          </Field>
          <Field label="Empresa">
            <TextInput name="empresa" placeholder="Empresa" />
          </Field>
          <Field label="WhatsApp">
            <TextInput name="whatsapp" placeholder="+55 11 90000-0000" />
          </Field>
          <Field label="Instagram">
            <TextInput name="instagram" placeholder="handle" />
          </Field>
          <Field label="Cupom utilizado">
            <TextInput name="cupom_utilizado" placeholder="PROMO10" />
          </Field>

          <div style={{ marginTop: 8 }}>
            <SubmitButton>Criar lead</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
