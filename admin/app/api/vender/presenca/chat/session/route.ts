import {
  appendMessages,
  getConversaByWhatsapp,
  upsertConversa,
  type StoredChatMessage,
} from "@/lib/presenca-chat-store";
import type { PresencaLeadChat } from "@/lib/presenca-sdr";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  action: "upsert" | "load" | "save_messages";
  lead?: PresencaLeadChat;
  conversationId?: string;
  browserKey?: string;
  whatsapp?: string;
  messages?: StoredChatMessage[];
  phase?: string;
  followUpStatus?: "active" | "closed_won" | "closed_lost" | "opted_out";
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (body.action === "load") {
    const wa = body.whatsapp || body.lead?.whatsapp;
    if (!wa) {
      return NextResponse.json({ error: "WhatsApp obrigatório" }, { status: 400 });
    }
    const row = await getConversaByWhatsapp(wa);
    return NextResponse.json({ conversation: row });
  }

  if (body.action === "upsert") {
    if (!body.lead) {
      return NextResponse.json({ error: "Lead obrigatório" }, { status: 400 });
    }
    const row = await upsertConversa({
      lead: body.lead,
      messages: body.messages,
      phase: body.phase,
      browserKey: body.browserKey,
      conversationId: body.conversationId,
    });
    if (!row) {
      return NextResponse.json(
        {
          error:
            "Não foi possível salvar. Aplique a migration lp_presenca_conversas no Supabase.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ conversation: row });
  }

  if (body.action === "save_messages") {
    if (!body.conversationId || !body.messages) {
      return NextResponse.json({ error: "conversationId e messages" }, { status: 400 });
    }
    const row = await appendMessages({
      conversationId: body.conversationId,
      messages: body.messages,
      phase: body.phase,
      followUpStatus: body.followUpStatus,
    });
    if (!row) {
      return NextResponse.json({ error: "Falha ao salvar mensagens" }, { status: 503 });
    }
    return NextResponse.json({ conversation: row });
  }

  return NextResponse.json({ error: "action inválida" }, { status: 400 });
}
