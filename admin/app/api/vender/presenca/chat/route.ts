import {
  buildLeadContext,
  conversationPhase,
  fallbackSdrReplies,
  parseBubbles,
  phaseInstruction,
  PRESENCA_SDR_SYSTEM,
  type ChatMessage,
  type ChatPhase,
  type PresencaLeadChat,
} from "@/lib/presenca-sdr";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

type Body = {
  lead: PresencaLeadChat;
  messages: { role: "user" | "assistant"; content: string }[];
};

function isLead(v: unknown): v is PresencaLeadChat {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.nome === "string" &&
    typeof o.email === "string" &&
    typeof o.whatsapp === "string" &&
    o.nome.trim().length > 1 &&
    o.email.includes("@") &&
    o.whatsapp.trim().length >= 8
  );
}

async function notifyN8n(
  lead: PresencaLeadChat,
  lastUser: string,
  phase: ChatPhase,
) {
  const url = process.env.PRESENCA_CHAT_WEBHOOK_URL?.trim();
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "lp-vender-presenca-chat",
        lead,
        phase,
        lastUserMessage: lastUser,
        at: new Date().toISOString(),
      }),
    });
  } catch {
    /* opcional */
  }
}

async function deepseekBubbles(
  lead: PresencaLeadChat,
  history: { role: "user" | "assistant"; content: string }[],
  phase: ChatPhase,
): Promise<string[] | null> {
  const key = process.env.DEEPSEEK_API_KEY?.trim();
  if (!key) return null;

  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";

  const messages: ChatMessage[] = [
    { role: "system", content: PRESENCA_SDR_SYSTEM },
    {
      role: "system",
      content: `Dados do lead:\n${buildLeadContext(lead)}\n\n${phaseInstruction(phase)}\n\nResponda só JSON {"bubbles":[...]} com 1–3 frases curtas e humanas.`,
    },
    ...history.slice(-18).map((m) => ({
      role: m.role,
      content: m.content.slice(0, 1500),
    })),
  ];

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: phase === "discovery" ? 0.75 : phase === "closer" ? 0.4 : 0.55,
      max_tokens: 320,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("[presenca-chat] deepseek", res.status, errText.slice(0, 280));
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return null;
  const bubbles = parseBubbles(text);
  return bubbles.length ? bubbles : null;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!isLead(body.lead)) {
    return NextResponse.json({ error: "Lead incompleto" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content?.trim()) {
    return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
  }

  const phase = conversationPhase(messages);
  void notifyN8n(body.lead, lastUser.content.trim(), phase);

  try {
    const bubbles = await deepseekBubbles(body.lead, messages, phase);
    if (bubbles?.length) {
      return NextResponse.json({
        replies: bubbles,
        reply: bubbles.join(" "),
        provider: "deepseek",
        phase,
      });
    }
  } catch (e) {
    console.error("[presenca-chat] deepseek", e);
  }

  // Só se a API cair — resposta curta de discovery, sem segundo provedor
  const fallback = fallbackSdrReplies(lastUser.content, body.lead, phase);
  return NextResponse.json({
    replies: fallback,
    reply: fallback.join(" "),
    provider: "fallback",
    phase,
  });
}
