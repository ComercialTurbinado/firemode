import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { getCommercialSnapshot, isValidEmail } from "@/lib/comercial-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SequenceStepInput = {
  atrasoDias?: number;
  canal?: "email" | "whatsapp" | "ligacao" | "tarefa";
  assunto?: string;
  corpo?: string;
};

type ActionBody = {
  action?: string;
  id?: string;
  contactId?: string;
  dealId?: string;
  funnelId?: string;
  stageId?: string;
  sequenceId?: string;
  stepId?: string;
  nome?: string;
  email?: string;
  whatsapp?: string;
  empresa?: string;
  cargo?: string;
  site?: string;
  origem?: string;
  responsavel?: string;
  observacoes?: string;
  tags?: string[];
  titulo?: string;
  produto?: string;
  valor?: number;
  probabilidade?: number;
  proximaAcao?: string;
  proximaAcaoEm?: string;
  tipo?: string;
  descricao?: string;
  vencimentoEm?: string;
  objetivo?: string;
  assunto?: string;
  corpo?: string;
  atrasoDias?: number;
  canal?: "email" | "whatsapp" | "ligacao" | "tarefa";
  stages?: string[];
  steps?: SequenceStepInput[];
};

function text(value: unknown, max = 500): string {
  return String(value ?? "").trim().slice(0, max);
}

function isoOrNull(value: unknown): string | null {
  const raw = text(value, 80);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function defaultFunnelAndStage() {
  const db = await createClient();
  const { data: funnel } = await db.from("crm_funis").select("id").eq("padrao", true).maybeSingle();
  const { data: fallback } = funnel
    ? { data: funnel }
    : await db.from("crm_funis").select("id").eq("ativo", true).order("criado_em").limit(1).maybeSingle();
  if (!fallback?.id) throw new Error("Crie um funil antes da oportunidade.");
  const { data: stage } = await db
    .from("crm_etapas")
    .select("id")
    .eq("funil_id", fallback.id)
    .eq("tipo", "aberta")
    .order("ordem")
    .limit(1)
    .maybeSingle();
  if (!stage?.id) throw new Error("O funil não possui etapa aberta.");
  return { funnelId: fallback.id, stageId: stage.id };
}

export async function GET() {
  return NextResponse.json(await getCommercialSnapshot(), {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request) {
  let body: ActionBody;
  try {
    body = (await request.json()) as ActionBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const db = await createClient();
  const now = new Date().toISOString();

  try {
    switch (body.action) {
      case "create_contact": {
        const nome = text(body.nome, 180);
        const email = text(body.email, 320).toLowerCase() || null;
        if (!nome) throw new Error("Informe o nome do contato.");
        if (email && !isValidEmail(email)) throw new Error("E-mail inválido.");

        let existing = null;
        if (email) {
          const result = await db.from("crm_contatos").select("*").ilike("email", email).maybeSingle();
          existing = result.data;
        }
        const payload = {
          nome,
          email,
          whatsapp: text(body.whatsapp, 40) || null,
          empresa: text(body.empresa, 180) || null,
          cargo: text(body.cargo, 120) || null,
          site: text(body.site, 500) || null,
          origem: text(body.origem, 80) || "manual",
          responsavel: text(body.responsavel, 120) || null,
          observacoes: text(body.observacoes, 5000) || null,
          tags: Array.isArray(body.tags) ? body.tags.map((tag) => text(tag, 40)).filter(Boolean).slice(0, 12) : [],
          atualizado_em: now,
        };
        const contactResult = existing
          ? await db.from("crm_contatos").update(payload).eq("id", existing.id).select("*").single()
          : await db.from("crm_contatos").insert(payload).select("*").single();
        if (contactResult.error) throw contactResult.error;

        if (body.titulo || body.valor) {
          const defaults = await defaultFunnelAndStage();
          const dealResult = await db.from("crm_negocios").insert({
            contato_id: contactResult.data.id,
            funil_id: body.funnelId || defaults.funnelId,
            etapa_id: body.stageId || defaults.stageId,
            titulo: text(body.titulo, 240) || `${payload.empresa || nome} · Sprint Presença`,
            produto: text(body.produto, 120) || "Sprint Presença",
            valor: Number.isFinite(body.valor) ? Math.max(0, Number(body.valor)) : 3900,
            probabilidade: Number.isFinite(body.probabilidade)
              ? Math.min(100, Math.max(0, Number(body.probabilidade)))
              : 20,
          });
          if (dealResult.error) throw dealResult.error;
        }
        break;
      }

      case "create_deal": {
        const contactId = text(body.contactId, 80);
        if (!contactId) throw new Error("Selecione um contato.");
        const defaults = await defaultFunnelAndStage();
        const result = await db.from("crm_negocios").insert({
          contato_id: contactId,
          funil_id: body.funnelId || defaults.funnelId,
          etapa_id: body.stageId || defaults.stageId,
          titulo: text(body.titulo, 240) || "Nova oportunidade",
          produto: text(body.produto, 120) || "Sprint Presença",
          valor: Number.isFinite(body.valor) ? Math.max(0, Number(body.valor)) : 3900,
          probabilidade: Number.isFinite(body.probabilidade)
            ? Math.min(100, Math.max(0, Number(body.probabilidade)))
            : 20,
          proxima_acao: text(body.proximaAcao, 500) || null,
          proxima_acao_em: isoOrNull(body.proximaAcaoEm),
        });
        if (result.error) throw result.error;
        break;
      }

      case "move_deal": {
        const dealId = text(body.dealId, 80);
        const stageId = text(body.stageId, 80);
        const { data: deal } = await db.from("crm_negocios").select("*").eq("id", dealId).single();
        const { data: stage } = await db.from("crm_etapas").select("*").eq("id", stageId).single();
        if (!deal || !stage || stage.funil_id !== deal.funil_id) throw new Error("Movimento inválido.");
        const status = stage.tipo === "ganha" ? "ganho" : stage.tipo === "perdida" ? "perdido" : "aberto";
        const result = await db.from("crm_negocios").update({
          etapa_id: stageId,
          status,
          probabilidade: stage.tipo === "ganha" ? 100 : stage.tipo === "perdida" ? 0 : deal.probabilidade,
          atualizado_em: now,
        }).eq("id", dealId);
        if (result.error) throw result.error;
        await db.from("crm_atividades").insert({
          contato_id: deal.contato_id,
          negocio_id: deal.id,
          tipo: "mudanca_etapa",
          titulo: `Movido para ${stage.nome}`,
        });
        break;
      }

      case "update_deal": {
        const dealId = text(body.dealId, 80);
        const result = await db.from("crm_negocios").update({
          titulo: text(body.titulo, 240) || undefined,
          produto: text(body.produto, 120) || undefined,
          valor: Number.isFinite(body.valor) ? Math.max(0, Number(body.valor)) : undefined,
          probabilidade: Number.isFinite(body.probabilidade)
            ? Math.min(100, Math.max(0, Number(body.probabilidade)))
            : undefined,
          proxima_acao: text(body.proximaAcao, 500) || null,
          proxima_acao_em: isoOrNull(body.proximaAcaoEm),
          atualizado_em: now,
        }).eq("id", dealId);
        if (result.error) throw result.error;
        break;
      }

      case "add_activity": {
        const allowed = ["nota", "email", "ligacao", "whatsapp", "reuniao", "tarefa"] as const;
        const requestedType = text(body.tipo, 30);
        const tipo: (typeof allowed)[number] = allowed.some((item) => item === requestedType)
          ? requestedType as (typeof allowed)[number]
          : "nota";
        const titulo = text(body.titulo, 240);
        if (!titulo) throw new Error("Informe o título da atividade.");
        const result = await db.from("crm_atividades").insert({
          contato_id: text(body.contactId, 80) || null,
          negocio_id: text(body.dealId, 80) || null,
          tipo,
          titulo,
          descricao: text(body.descricao, 5000) || null,
          vencimento_em: isoOrNull(body.vencimentoEm),
        });
        if (result.error) throw result.error;
        break;
      }

      case "complete_activity": {
        const result = await db.from("crm_atividades").update({ concluida: true }).eq("id", text(body.id, 80));
        if (result.error) throw result.error;
        break;
      }

      case "create_funnel": {
        const nome = text(body.nome, 180);
        if (!nome) throw new Error("Informe o nome do funil.");
        const funnelResult = await db.from("crm_funis").insert({
          nome,
          descricao: text(body.descricao, 1000) || null,
        }).select("id").single();
        if (funnelResult.error) throw funnelResult.error;
        const names = (body.stages ?? []).map((stage) => text(stage, 80)).filter(Boolean);
        const defaults = names.length ? names : ["Mapeado", "Abordado", "Respondeu", "Call", "Proposta", "Ganho", "Perdido"];
        const colors = ["#64748b", "#2563eb", "#7c3aed", "#d97706", "#ea580c", "#15803d", "#dc2626"];
        const stageResult = await db.from("crm_etapas").insert(defaults.map((stage, index) => ({
          funil_id: funnelResult.data.id,
          nome: stage,
          cor: colors[index % colors.length],
          ordem: (index + 1) * 10,
          tipo: (/ganh/i.test(stage) ? "ganha" : /perdid/i.test(stage) ? "perdida" : "aberta") as
            | "aberta"
            | "ganha"
            | "perdida",
        })));
        if (stageResult.error) throw stageResult.error;
        break;
      }

      case "create_sequence": {
        const nome = text(body.nome, 180);
        const steps = Array.isArray(body.steps) ? body.steps : [];
        if (!nome || !steps.length) throw new Error("Informe nome e pelo menos uma etapa.");
        const sequenceResult = await db.from("crm_cadencias").insert({
          nome,
          objetivo: text(body.objetivo, 1000) || null,
        }).select("id").single();
        if (sequenceResult.error) throw sequenceResult.error;
        const stepResult = await db.from("crm_cadencia_etapas").insert(steps.map((step, index) => ({
          cadencia_id: sequenceResult.data.id,
          ordem: index + 1,
          atraso_dias: Math.max(0, Number(step.atrasoDias ?? 0)),
          canal: step.canal || "email",
          assunto: text(step.assunto, 300) || null,
          corpo: text(step.corpo, 10000),
        })));
        if (stepResult.error) throw stepResult.error;
        break;
      }

      case "update_sequence": {
        const sequenceId = text(body.sequenceId, 80);
        const nome = text(body.nome, 180);
        const steps = Array.isArray(body.steps) ? body.steps : [];
        if (!sequenceId || !nome || !steps.length) {
          throw new Error("Informe a cadência, o nome e pelo menos uma etapa.");
        }
        const updateResult = await db.from("crm_cadencias").update({
          nome,
          objetivo: text(body.objetivo, 1000) || null,
          atualizado_em: now,
        }).eq("id", sequenceId);
        if (updateResult.error) throw updateResult.error;
        const deleteResult = await db.from("crm_cadencia_etapas").delete().eq("cadencia_id", sequenceId);
        if (deleteResult.error) throw deleteResult.error;
        const stepResult = await db.from("crm_cadencia_etapas").insert(steps.map((step, index) => ({
          cadencia_id: sequenceId,
          ordem: index + 1,
          atraso_dias: Math.max(0, Number(step.atrasoDias ?? 0)),
          canal: step.canal || "email",
          assunto: text(step.assunto, 300) || null,
          corpo: text(step.corpo, 10000),
        })));
        if (stepResult.error) throw stepResult.error;
        break;
      }

      case "update_sequence_step": {
        const stepId = text(body.stepId, 80);
        const corpo = text(body.corpo, 10000);
        if (!stepId || !corpo) throw new Error("Informe a etapa e a mensagem.");
        const canal = body.canal || "email";
        const result = await db.from("crm_cadencia_etapas").update({
          canal,
          atraso_dias: Math.max(0, Number(body.atrasoDias ?? 0)),
          assunto: text(body.assunto, 300) || null,
          corpo,
        }).eq("id", stepId);
        if (result.error) throw result.error;
        break;
      }

      case "enroll_sequence": {
        const sequenceId = text(body.sequenceId, 80);
        const contactId = text(body.contactId, 80);
        const { data: firstStep } = await db.from("crm_cadencia_etapas")
          .select("atraso_dias").eq("cadencia_id", sequenceId).order("ordem").limit(1).maybeSingle();
        if (!firstStep) throw new Error("Cadência sem etapas.");
        const next = new Date();
        next.setDate(next.getDate() + firstStep.atraso_dias);
        const result = await db.from("crm_cadencia_inscricoes").upsert({
          cadencia_id: sequenceId,
          contato_id: contactId,
          negocio_id: text(body.dealId, 80) || null,
          status: "ativa",
          etapa_atual: 0,
          proximo_envio_em: next.toISOString(),
          atualizado_em: now,
        }, { onConflict: "cadencia_id,contato_id" });
        if (result.error) throw result.error;
        break;
      }

      default:
        return NextResponse.json({ error: "Ação desconhecida." }, { status: 400 });
    }

    return NextResponse.json(await getCommercialSnapshot(), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível concluir.";
    console.error("[api/comercial]", body.action, error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
