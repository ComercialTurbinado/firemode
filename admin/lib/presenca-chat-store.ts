import { createClient } from "@/lib/supabase";
import type { Database, LpPresencaConversa } from "@/lib/database.types";
import type { PresencaLeadChat } from "@/lib/presenca-sdr";

export type StoredChatMessage = {
  role: "user" | "assistant";
  content: string;
  at?: string;
};

export type PresencaConversaRow = LpPresencaConversa;

type ConversaInsert = Database["public"]["Tables"]["lp_presenca_conversas"]["Insert"];
type ConversaUpdate = Database["public"]["Tables"]["lp_presenca_conversas"]["Update"];

export function digitsOnly(wa: string): string {
  return wa.replace(/\D/g, "");
}

export function weekFromNow(): string {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Espelha o lead qualificado do chat no CRM. O chat continua funcionando mesmo
 * se a migração comercial ainda não tiver sido aplicada.
 */
async function syncLeadToCommercial(lead: PresencaLeadChat): Promise<void> {
  try {
    const sb = await createClient();
    const email = lead.email.trim().toLowerCase();
    const telefone = digitsOnly(lead.whatsapp);

    const byEmail = email
      ? await sb.from("crm_contatos").select("id").eq("email", email).maybeSingle()
      : { data: null };
    const byPhone = !byEmail.data?.id && telefone
      ? await sb.from("crm_contatos").select("id").eq("whatsapp", telefone).maybeSingle()
      : { data: null };

    let contatoId = byEmail.data?.id ?? byPhone.data?.id ?? null;
    if (contatoId) {
      await sb
        .from("crm_contatos")
        .update({
          nome: lead.nome.trim(),
          email: email || null,
          whatsapp: telefone,
          empresa: lead.presence?.trim() || null,
          origem: "LP Presença",
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", contatoId);
    } else {
      const { data: created } = await sb
        .from("crm_contatos")
        .insert({
          nome: lead.nome.trim(),
          email: email || null,
          whatsapp: telefone,
          empresa: lead.presence?.trim() || null,
          origem: "LP Presença",
        })
        .select("id")
        .maybeSingle();
      contatoId = created?.id ?? null;
    }

    if (!contatoId) return;
    const { data: existingDeal } = await sb
      .from("crm_negocios")
      .select("id")
      .eq("contato_id", contatoId)
      .eq("status", "aberto")
      .order("atualizado_em", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingDeal?.id) return;

    const { data: funnel } = await sb
      .from("crm_funis")
      .select("id")
      .eq("ativo", true)
      .order("criado_em", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!funnel?.id) return;
    const { data: stage } = await sb
      .from("crm_etapas")
      .select("id")
      .eq("funil_id", funnel.id)
      .order("ordem", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!stage?.id) return;

    const { data: deal } = await sb
      .from("crm_negocios")
      .insert({
        contato_id: contatoId,
        funil_id: funnel.id,
        etapa_id: stage.id,
        titulo: "Sprint Presença — " + lead.nome.trim(),
        valor: 3900,
        probabilidade: 10,
        produto: "Sprint Presença",
        proxima_acao: "Responder o lead e qualificar o gargalo",
        proxima_acao_em: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();

    if (deal?.id) {
      await sb.from("crm_atividades").insert({
        negocio_id: deal.id,
        contato_id: contatoId,
        tipo: "nota",
        titulo: "Lead entrou pela LP Presença",
        descricao: lead.presence?.trim() || null,
      });
    }
  } catch (error) {
    console.error("[presenca-chat] crm sync", error);
  }
}

/** Próximo follow-up: +1 dia na 1ª, +2 na 2ª, +2 na 3ª (máx 3 no ciclo de 7 dias) */
export function nextFollowUpAt(count: number): string | null {
  if (count >= 3) return null;
  const days = count === 0 ? 1 : 2;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function purgeExpiredConversas(): Promise<number> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("lp_presenca_conversas")
    .delete()
    .eq("is_cliente", false)
    .lt("expires_at", new Date().toISOString())
    .select("id");
  if (error) {
    console.error("[presenca-chat] purge", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

export async function upsertConversa(input: {
  lead: PresencaLeadChat;
  messages?: StoredChatMessage[];
  phase?: string;
  browserKey?: string | null;
  conversationId?: string | null;
}): Promise<PresencaConversaRow | null> {
  const sb = await createClient();
  const wa = digitsOnly(input.lead.whatsapp);
  if (wa.length < 10) return null;

  void purgeExpiredConversas();

  const now = new Date().toISOString();
  const payload = {
    whatsapp_digits: wa,
    nome: input.lead.nome.trim(),
    email: input.lead.email.trim(),
    presence: input.lead.presence?.trim() || null,
    ...(input.messages ? { messages: input.messages } : {}),
    ...(input.phase ? { phase: input.phase } : {}),
    browser_key: input.browserKey ?? null,
    last_message_at: now,
    updated_at: now,
    expires_at: weekFromNow(),
    follow_up_status: "active" as const,
    next_follow_up_at: nextFollowUpAt(0),
  };

  if (input.conversationId) {
    const { data, error } = await sb
      .from("lp_presenca_conversas")
      .update(payload as ConversaUpdate)
      .eq("id", input.conversationId)
      .select("*")
      .maybeSingle();
    if (error) {
      console.error("[presenca-chat] update", error.message);
      return null;
    }
    await syncLeadToCommercial(input.lead);
    return data;
  }

  const { data: existing } = await sb
    .from("lp_presenca_conversas")
    .select("id, messages, follow_up_count, is_cliente")
    .eq("whatsapp_digits", wa)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await sb
      .from("lp_presenca_conversas")
      .update({
        ...payload,
        expires_at: existing.is_cliente
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : weekFromNow(),
        messages: input.messages ?? existing.messages ?? [],
      } as ConversaUpdate)
      .eq("id", existing.id)
      .select("*")
      .maybeSingle();
    if (error) {
      console.error("[presenca-chat] upsert update", error.message);
      return null;
    }
    await syncLeadToCommercial(input.lead);
    return data;
  }

  const insertRow: ConversaInsert = {
    ...payload,
    messages: input.messages ?? [],
    follow_up_count: 0,
    is_cliente: false,
  };

  const { data, error } = await sb
    .from("lp_presenca_conversas")
    .insert(insertRow)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[presenca-chat] insert", error.message);
    return null;
  }
  await syncLeadToCommercial(input.lead);
  return data;
}

export async function getConversaByWhatsapp(
  whatsapp: string,
): Promise<PresencaConversaRow | null> {
  const sb = await createClient();
  const wa = digitsOnly(whatsapp);
  if (wa.length < 10) return null;

  void purgeExpiredConversas();

  const { data, error } = await sb
    .from("lp_presenca_conversas")
    .select("*")
    .eq("whatsapp_digits", wa)
    .maybeSingle();

  if (error) {
    console.error("[presenca-chat] get", error.message);
    return null;
  }
  if (!data) return null;

  if (!data.is_cliente && new Date(data.expires_at).getTime() < Date.now()) {
    await sb.from("lp_presenca_conversas").delete().eq("id", data.id);
    return null;
  }
  return data;
}

export async function appendMessages(input: {
  conversationId: string;
  messages: StoredChatMessage[];
  phase?: string;
  followUpStatus?: PresencaConversaRow["follow_up_status"];
}): Promise<PresencaConversaRow | null> {
  const sb = await createClient();
  const now = new Date().toISOString();

  const patch: ConversaUpdate = {
    messages: input.messages,
    last_message_at: now,
    updated_at: now,
    expires_at: weekFromNow(),
  };
  if (input.phase) patch.phase = input.phase;
  if (input.followUpStatus) {
    patch.follow_up_status = input.followUpStatus;
    if (input.followUpStatus !== "active") {
      patch.next_follow_up_at = null;
    }
  }

  const { data, error } = await sb
    .from("lp_presenca_conversas")
    .update(patch)
    .eq("id", input.conversationId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[presenca-chat] append", error.message);
    return null;
  }
  return data;
}

export async function listDueFollowUps(limit = 50): Promise<PresencaConversaRow[]> {
  const sb = await createClient();
  void purgeExpiredConversas();
  const { data, error } = await sb
    .from("lp_presenca_conversas")
    .select("*")
    .eq("follow_up_status", "active")
    .eq("is_cliente", false)
    .lte("next_follow_up_at", new Date().toISOString())
    .order("next_follow_up_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[presenca-chat] followups", error.message);
    return [];
  }
  return data ?? [];
}

export async function markFollowUpSent(id: string, count: number): Promise<void> {
  const sb = await createClient();
  const nextCount = count + 1;
  await sb
    .from("lp_presenca_conversas")
    .update({
      follow_up_count: nextCount,
      next_follow_up_at: nextFollowUpAt(nextCount),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}
