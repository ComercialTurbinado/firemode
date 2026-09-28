import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { whatsappPropostaUrl, type CanalMarcado } from "@/lib/apresentacao-cta";

export const dynamic = "force-dynamic";

/** Registra pedido de proposta e devolve link WhatsApp comercial. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const analiseId = String(body.analise_web_id || "").trim();
  const modo = body.modo === "tudo" ? "tudo" : "marcado";
  const sessionKey = String(body.session_key || "default").trim().slice(0, 80);
  const empresa = String(body.empresa || "empresa").trim();
  const canais = (Array.isArray(body.canais) ? body.canais : [])
    .map((c: { id?: string; label?: string }) => ({
      id: String(c?.id || "").trim(),
      label: String(c?.label || c?.id || "").trim(),
    }))
    .filter((c: CanalMarcado) => c.id && c.label) as CanalMarcado[];

  if (!analiseId) {
    return NextResponse.json({ error: "analise_web_id obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apresentacao_propostas")
    .insert({
      analise_web_id: analiseId,
      modo,
      canais,
      session_key: sessionKey,
    })
    .select("id, criado_em")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const wa = whatsappPropostaUrl({
    empresa,
    modo,
    canais,
    analiseId,
  });

  return NextResponse.json({
    ok: true,
    proposta: data,
    whatsapp_url: wa,
    aviso: wa
      ? null
      : "Configure NEXT_PUBLIC_COMERCIAL_WHATSAPP (ex.: 5511999999999) para abrir o WhatsApp.",
  });
}
