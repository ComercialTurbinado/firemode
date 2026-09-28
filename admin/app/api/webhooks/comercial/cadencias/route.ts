import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { isMailgunConfigured, mailgunFromAddress, sendMail } from "@/lib/mailgun";
import { emailThreadKey, parseEmailAddress } from "@/lib/comercial-store";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = process.env.CRM_CADENCE_CRON_SECRET?.trim();
  if (!secret) return false;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return token === secret;
}

function personalize(value: string, contact: { nome: string; empresa: string | null }): string {
  const firstName = contact.nome.trim().split(/\s+/)[0] || contact.nome;
  return value
    .replaceAll("{{nome}}", contact.nome)
    .replaceAll("{{primeiro_nome}}", firstName)
    .replaceAll("{{empresa}}", contact.empresa || "sua empresa");
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await createClient();
  const now = new Date();
  const { data: enrollments, error } = await db.from("crm_cadencia_inscricoes")
    .select("*")
    .eq("status", "ativa")
    .lte("proximo_envio_em", now.toISOString())
    .order("proximo_envio_em")
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  let tasks = 0;
  const failures: string[] = [];
  for (const enrollment of enrollments ?? []) {
    try {
      const [{ data: contact }, { data: steps }] = await Promise.all([
        db.from("crm_contatos").select("*").eq("id", enrollment.contato_id).single(),
        db.from("crm_cadencia_etapas").select("*").eq("cadencia_id", enrollment.cadencia_id).order("ordem"),
      ]);
      const step = steps?.[enrollment.etapa_atual];
      if (!contact || !step) {
        await db.from("crm_cadencia_inscricoes").update({ status: "concluida", atualizado_em: now.toISOString() }).eq("id", enrollment.id);
        continue;
      }

      const subject = personalize(step.assunto || "Contato Firemode", contact);
      const body = personalize(step.corpo, contact);
      if (step.canal === "email") {
        if (!contact.aceita_email || !contact.email || !isMailgunConfigured()) throw new Error("email_indisponivel");
        const from = parseEmailAddress(mailgunFromAddress());
        const result = await sendMail({ to: contact.email, subject, text: body });
        const { data: mail } = await db.from("crm_emails").insert({
          contato_id: contact.id,
          negocio_id: enrollment.negocio_id,
          direcao: "saida",
          status: "enviado",
          de_email: from.email,
          de_nome: from.name || "Firemode",
          para_email: contact.email,
          assunto: subject,
          corpo_texto: body,
          mailgun_id: result.id || null,
          thread_key: emailThreadKey({ from: from.email, to: contact.email, subject }),
          lido: true,
        }).select("id").single();
        await db.from("crm_atividades").insert({
          contato_id: contact.id,
          negocio_id: enrollment.negocio_id,
          tipo: "email",
          titulo: `Cadência: ${subject}`,
          descricao: body.slice(0, 1000),
          metadata: { cadencia_id: enrollment.cadencia_id, email_id: mail?.id },
        });
        sent += 1;
      } else {
        await db.from("crm_atividades").insert({
          contato_id: contact.id,
          negocio_id: enrollment.negocio_id,
          tipo: step.canal === "tarefa" ? "tarefa" : step.canal,
          titulo: subject,
          descricao: body,
          vencimento_em: now.toISOString(),
          metadata: { cadencia_id: enrollment.cadencia_id },
        });
        tasks += 1;
      }

      const nextIndex = enrollment.etapa_atual + 1;
      const nextStep = steps?.[nextIndex];
      const nextDate = new Date();
      if (nextStep) nextDate.setDate(nextDate.getDate() + nextStep.atraso_dias);
      await db.from("crm_cadencia_inscricoes").update({
        etapa_atual: nextIndex,
        status: nextStep ? "ativa" : "concluida",
        proximo_envio_em: nextStep ? nextDate.toISOString() : null,
        atualizado_em: new Date().toISOString(),
      }).eq("id", enrollment.id);
    } catch (err) {
      failures.push(`${enrollment.id}:${err instanceof Error ? err.message : "failed"}`);
      const retry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await db.from("crm_cadencia_inscricoes").update({ proximo_envio_em: retry, atualizado_em: new Date().toISOString() }).eq("id", enrollment.id);
    }
  }

  return NextResponse.json({ processed: enrollments?.length ?? 0, sent, tasks, failures });
}
