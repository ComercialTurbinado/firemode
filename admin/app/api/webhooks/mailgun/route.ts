import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import {
  fetchStoredMessage,
  isMailgunConfigured,
  verifyMailgunWebhook,
  type StoredMailgunMessage,
} from "@/lib/mailgun";
import { emailThreadKey, parseEmailAddress } from "@/lib/comercial-store";

export const runtime = "nodejs";

type Fields = Record<string, string>;

async function readFields(request: Request): Promise<Fields> {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    const json = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!json) return {};
    const event = (json["event-data"] ?? json) as Record<string, unknown>;
    const signature = (event.signature ?? {}) as Record<string, unknown>;
    const message = (event.message ?? {}) as Record<string, unknown>;
    const headers = (message.headers ?? {}) as Record<string, unknown>;
    return {
      timestamp: String(signature.timestamp ?? json.timestamp ?? ""),
      token: String(signature.token ?? json.token ?? ""),
      signature: String(signature.signature ?? json.signature ?? ""),
      from: String(headers.from ?? json.from ?? ""),
      recipient: String(event.recipient ?? json.recipient ?? ""),
      subject: String(headers.subject ?? json.subject ?? ""),
      "message-id": String(headers["message-id"] ?? json["message-id"] ?? ""),
    };
  }
  const form = await request.formData().catch(() => null);
  if (!form) return {};
  const fields: Fields = {};
  for (const [key, value] of form.entries()) if (typeof value === "string") fields[key] = value;
  return fields;
}

export async function POST(request: Request) {
  if (!isMailgunConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 404 });
  const fields = await readFields(request);
  if (!verifyMailgunWebhook(fields)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 406 });
  }

  let stored: StoredMailgunMessage | null = null;
  const messageUrl = fields["message-url"]?.trim();
  if (messageUrl) {
    try { stored = await fetchStoredMessage(messageUrl); } catch (error) { console.error("[mailgun] storage", error); }
  }
  const from = parseEmailAddress(stored?.from || stored?.sender || fields.from || fields.sender || "");
  const to = parseEmailAddress(stored?.recipient || fields.recipient || fields.To || "");
  if (!from.email || !to.email) return NextResponse.json({ error: "missing_address" }, { status: 400 });

  const subject = (stored?.subject || fields.subject || "(sem assunto)").slice(0, 500);
  const text = (stored?.strippedText || stored?.bodyPlain || fields["stripped-text"] || fields["body-plain"] || "").slice(0, 20_000);
  const html = (stored?.strippedHtml || stored?.bodyHtml || fields["stripped-html"] || fields["body-html"] || "").slice(0, 80_000);
  const messageId = stored?.messageId || fields["Message-Id"] || fields["message-id"] || "";
  const inReplyTo = stored?.inReplyTo || fields["In-Reply-To"] || "";
  const mailgunId = messageId || messageUrl || fields.token || null;
  const db = await createClient();

  let { data: contact } = await db.from("crm_contatos").select("*").ilike("email", from.email).maybeSingle();
  if (!contact) {
    const created = await db.from("crm_contatos").insert({
      nome: from.name || from.email.split("@")[0] || "Contato por e-mail",
      email: from.email,
      origem: "email",
      tags: ["inbound"],
    }).select("*").single();
    if (created.error) return NextResponse.json({ error: created.error.message }, { status: 500 });
    contact = created.data;
  }

  const { data: deal } = await db.from("crm_negocios").select("*")
    .eq("contato_id", contact.id).eq("status", "aberto").order("atualizado_em", { ascending: false }).limit(1).maybeSingle();
  const { data: mail, error } = await db.from("crm_emails").insert({
    contato_id: contact.id,
    negocio_id: deal?.id ?? null,
    direcao: "entrada",
    status: "recebido",
    de_email: from.email,
    de_nome: from.name || null,
    para_email: to.email,
    assunto: subject,
    corpo_texto: text || null,
    corpo_html: html || null,
    mailgun_id: mailgunId,
    message_id: messageId || null,
    in_reply_to: inReplyTo || null,
    thread_key: emailThreadKey({ from: from.email, to: to.email, subject }),
  }).select("*").single();
  if (error?.code === "23505") {
    return NextResponse.json({ ok: true, duplicate: true });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("crm_cadencia_inscricoes").update({ status: "respondeu", atualizado_em: new Date().toISOString() })
    .eq("contato_id", contact.id).eq("status", "ativa");
  await db.from("crm_atividades").insert({
    contato_id: contact.id,
    negocio_id: deal?.id ?? null,
    tipo: "email",
    titulo: `Resposta recebida: ${subject}`,
    descricao: text.slice(0, 1000) || null,
    metadata: mail?.id ? { email_id: mail.id } : {},
  });

  if (deal) {
    const { data: currentStage } = await db.from("crm_etapas").select("nome").eq("id", deal.etapa_id).maybeSingle();
    if (currentStage && /mapeado|abordado/i.test(currentStage.nome)) {
      const { data: repliedStage } = await db.from("crm_etapas").select("id")
        .eq("funil_id", deal.funil_id).ilike("nome", "%respondeu%").limit(1).maybeSingle();
      if (repliedStage) await db.from("crm_negocios").update({ etapa_id: repliedStage.id, atualizado_em: new Date().toISOString() }).eq("id", deal.id);
    }
  }
  return NextResponse.json({ ok: true, stored: Boolean(stored) });
}
