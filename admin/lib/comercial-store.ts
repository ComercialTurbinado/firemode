import { createClient } from "@/lib/supabase";
import { isMailgunConfigured, mailgunMissingEnv } from "@/lib/mailgun";
import type {
  CommercialSnapshot,
  CrmActivity,
  CrmContact,
  CrmDeal,
  CrmEmail,
  CrmEnrollment,
  CrmFunnel,
  CrmSequence,
  CrmSequenceStep,
  CrmStage,
} from "@/lib/comercial-types";

const emptySnapshot = (): CommercialSnapshot => ({
  capturedAt: new Date().toISOString(),
  funnels: [],
  stages: [],
  contacts: [],
  deals: [],
  activities: [],
  emails: [],
  sequences: [],
  sequenceSteps: [],
  enrollments: [],
  setupRequired: false,
  mailgunConfigured: isMailgunConfigured(),
  mailgunMissing: mailgunMissingEnv(),
});

export async function getCommercialSnapshot(): Promise<CommercialSnapshot> {
  const snapshot = emptySnapshot();
  try {
    const db = await createClient();
    const [funnels, stages, contacts, deals, activities, emails, sequences, steps, enrollments] =
      await Promise.all([
        db.from("crm_funis").select("*").eq("ativo", true).order("padrao", { ascending: false }),
        db.from("crm_etapas").select("*").order("ordem"),
        db.from("crm_contatos").select("*").order("atualizado_em", { ascending: false }).limit(250),
        db.from("crm_negocios").select("*").order("atualizado_em", { ascending: false }).limit(500),
        db.from("crm_atividades").select("*").order("criado_em", { ascending: false }).limit(400),
        db.from("crm_emails").select("*").order("criado_em", { ascending: false }).limit(200),
        db.from("crm_cadencias").select("*").order("criado_em", { ascending: false }),
        db.from("crm_cadencia_etapas").select("*").order("ordem"),
        db.from("crm_cadencia_inscricoes").select("*").order("criado_em", { ascending: false }),
      ]);

    const firstError = [funnels, stages, contacts, deals, activities, emails, sequences, steps, enrollments]
      .find((result) => result.error)?.error;
    if (firstError) {
      if (/crm_|relation .* does not exist|schema cache/i.test(firstError.message)) {
        return { ...snapshot, setupRequired: true };
      }
      throw firstError;
    }

    return {
      ...snapshot,
      funnels: (funnels.data ?? []) as CrmFunnel[],
      stages: (stages.data ?? []) as CrmStage[],
      contacts: (contacts.data ?? []) as CrmContact[],
      deals: (deals.data ?? []).map((deal) => ({ ...deal, valor: Number(deal.valor) })) as CrmDeal[],
      activities: (activities.data ?? []) as CrmActivity[],
      emails: (emails.data ?? []) as CrmEmail[],
      sequences: (sequences.data ?? []) as CrmSequence[],
      sequenceSteps: (steps.data ?? []) as CrmSequenceStep[],
      enrollments: (enrollments.data ?? []) as CrmEnrollment[],
    };
  } catch (error) {
    console.error("[comercial] snapshot", error);
    return { ...snapshot, setupRequired: true };
  }
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeSubject(value: string): string {
  return value
    .replace(/^\s*((re|fw|fwd|enc|res)\s*:\s*)+/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function emailThreadKey(input: { from: string; to: string; subject: string }): string {
  const people = [normalizeEmail(input.from), normalizeEmail(input.to)].filter(Boolean).sort();
  return `${people.join("|")}|${normalizeSubject(input.subject)}`;
}

export function parseEmailAddress(raw: string): { email: string; name?: string } {
  const value = raw.trim();
  const match = value.match(/^(.*)<([^>]+)>\s*$/);
  if (!match) return { email: normalizeEmail(value) };
  const name = match[1]!.replace(/^["']|["']$/g, "").trim();
  return { email: normalizeEmail(match[2]!), name: name || undefined };
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}
