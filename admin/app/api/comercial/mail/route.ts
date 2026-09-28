import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import {
  ensureMailgunInboundRoute,
  isMailgunConfigured,
  mailgunFromAddress,
  mailgunMissingEnv,
  sendMail,
} from "@/lib/mailgun";
import {
  emailThreadKey,
  isValidEmail,
  parseEmailAddress,
} from "@/lib/comercial-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const db = await createClient();
  const url = new URL(request.url);
  const direction = url.searchParams.get("direction");
  const q = url.searchParams.get("q")?.trim() || "";
  let query = db.from("crm_emails").select("*").order("criado_em", { ascending: false }).limit(150);
  if (direction === "entrada" || direction === "saida") query = query.eq("direcao", direction);
  if (q) query = query.or(`assunto.ilike.%${q}%,de_email.ilike.%${q}%,para_email.ilike.%${q}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    messages: data ?? [],
    mailgunConfigured: isMailgunConfigured(),
    mailgunMissing: mailgunMissingEnv(),
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  if (!isMailgunConfigured()) {
    return NextResponse.json({ error: "Mailgun não configurado." }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as {
    to?: string;
    subject?: string;
    text?: string;
    contactId?: string;
    dealId?: string;
    inReplyTo?: string;
    messageId?: string;
  } | null;
  if (!body) return NextResponse.json({ error: "JSON inválido." }, { status: 400 });

  const to = parseEmailAddress(String(body.to ?? ""));
  const subject = String(body.subject ?? "").trim().slice(0, 500);
  const messageText = String(body.text ?? "").trim().slice(0, 20_000);
  if (!isValidEmail(to.email)) return NextResponse.json({ error: "Destinatário inválido." }, { status: 400 });
  if (!subject || !messageText) return NextResponse.json({ error: "Assunto e mensagem são obrigatórios." }, { status: 400 });

  const from = parseEmailAddress(mailgunFromAddress());
  const headers: Record<string, string> = {};
  if (body.inReplyTo) headers["In-Reply-To"] = body.inReplyTo;
  if (body.messageId || body.inReplyTo) headers.References = [body.inReplyTo, body.messageId].filter(Boolean).join(" ");

  try {
    const sent = await sendMail({ to: to.email, subject, text: messageText, headers });
    const db = await createClient();
    let contactId = body.contactId?.trim() || null;
    if (!contactId) {
      const { data: contact } = await db.from("crm_contatos").select("id").ilike("email", to.email).maybeSingle();
      contactId = contact?.id ?? null;
    }
    const { data: mail, error } = await db.from("crm_emails").insert({
      contato_id: contactId,
      negocio_id: body.dealId?.trim() || null,
      direcao: "saida",
      status: "enviado",
      de_email: from.email,
      de_nome: from.name || "Firemode",
      para_email: to.email,
      assunto: subject,
      corpo_texto: messageText,
      mailgun_id: sent.id || null,
      in_reply_to: body.inReplyTo || null,
      thread_key: emailThreadKey({ from: from.email, to: to.email, subject }),
      lido: true,
    }).select("*").single();
    if (error) throw error;
    if (contactId) {
      await db.from("crm_atividades").insert({
        contato_id: contactId,
        negocio_id: body.dealId?.trim() || null,
        tipo: "email",
        titulo: `E-mail enviado: ${subject}`,
        descricao: messageText.slice(0, 1000),
        metadata: { email_id: mail.id },
      });
    }
    return NextResponse.json({ message: mail }, { status: 201 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Falha no envio.";
    console.error("[api/comercial/mail]", error);
    return NextResponse.json({ error: detail }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  if (!isMailgunConfigured()) return NextResponse.json({ error: "Mailgun não configurado." }, { status: 503 });
  try {
    return NextResponse.json(await ensureMailgunInboundRoute(request.url));
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Não foi possível ativar a caixa de entrada.";
    return NextResponse.json({ error: detail }, { status: detail === "public_url_required" ? 400 : 502 });
  }
}
