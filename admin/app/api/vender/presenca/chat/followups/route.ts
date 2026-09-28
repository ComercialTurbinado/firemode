import {
  listDueFollowUps,
  markFollowUpSent,
  purgeExpiredConversas,
} from "@/lib/presenca-chat-store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Lista conversas ativas com follow-up vencido (para n8n / cron).
 * Header: Authorization: Bearer ${PRESENCA_CHAT_CRON_SECRET}
 */
export async function GET(req: Request) {
  const secret = process.env.PRESENCA_CHAT_CRON_SECRET?.trim();
  const auth = req.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const purged = await purgeExpiredConversas();
  const due = await listDueFollowUps(50);

  return NextResponse.json({
    purged,
    count: due.length,
    conversations: due.map((c) => ({
      id: c.id,
      nome: c.nome,
      email: c.email,
      whatsapp: c.whatsapp_digits,
      follow_up_count: c.follow_up_count,
      last_message_at: c.last_message_at,
      messages_preview: (Array.isArray(c.messages) ? c.messages : []).slice(-4),
    })),
  });
}

/** Marca follow-up enviado: { id } */
export async function POST(req: Request) {
  const secret = process.env.PRESENCA_CHAT_CRON_SECRET?.trim();
  const auth = req.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string; follow_up_count?: number };
  try {
    body = (await req.json()) as { id?: string; follow_up_count?: number };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  await markFollowUpSent(body.id, body.follow_up_count ?? 0);
  return NextResponse.json({ ok: true });
}
