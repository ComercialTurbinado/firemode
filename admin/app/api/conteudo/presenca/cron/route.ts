import { iniciarPresencaPipeline } from "@/lib/content-machine";
import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type AutoConfig = {
  cliente_handle: string;
  ativo: boolean;
  intervalo_dias: number;
  ultima_verificacao_em: string | null;
};

function cronSecretOk(req: Request) {
  const secret = process.env.PRESENCA_CRON_SECRET?.trim()
    || process.env.PRESENCA_CHAT_CRON_SECRET?.trim();
  const auth = req.headers.get("authorization") || "";
  return Boolean(secret && auth === `Bearer ${secret}`);
}

function isDue(cfg: AutoConfig, now = Date.now()) {
  if (!cfg.ativo) return false;
  if (!cfg.ultima_verificacao_em) return true;
  const last = Date.parse(cfg.ultima_verificacao_em);
  if (Number.isNaN(last)) return true;
  const ms = (cfg.intervalo_dias || 15) * 24 * 60 * 60 * 1000;
  return now - last >= ms;
}

/**
 * Lista contas com verificação automática vencida (7/15/30d).
 * Header: Authorization: Bearer ${PRESENCA_CRON_SECRET}
 */
export async function GET(req: Request) {
  if (!cronSecretOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("presenca_auto_config")
    .select("cliente_handle, ativo, intervalo_dias, ultima_verificacao_em")
    .eq("ativo", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const due = ((data ?? []) as AutoConfig[]).filter((c) => isDue(c));
  return NextResponse.json({
    count: due.length,
    due: due.map((c) => ({
      cliente_handle: c.cliente_handle,
      intervalo_dias: c.intervalo_dias,
      ultima_verificacao_em: c.ultima_verificacao_em,
    })),
  });
}

/**
 * Dispara refresh de presença para contas vencidas.
 * Body opcional: { limit?: number, force?: boolean, handles?: string[] }
 */
export async function POST(req: Request) {
  if (!cronSecretOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { limit?: number; force?: boolean; handles?: string[] } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const limit = Math.min(Math.max(Number(body.limit) || 20, 1), 50);
  const force = Boolean(body.force);
  const onlyHandles = Array.isArray(body.handles)
    ? body.handles.map((h) => String(h).replace(/^@/, "").toLowerCase().trim())
    : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("presenca_auto_config")
    .select("cliente_handle, ativo, intervalo_dias, ultima_verificacao_em")
    .eq("ativo", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let due = ((data ?? []) as AutoConfig[]).filter((c) => isDue(c) || force);
  if (onlyHandles?.length) {
    const set = new Set(onlyHandles.map((h) => h.replace(/^@/, "").toLowerCase()));
    due = due.filter((c) => set.has(c.cliente_handle.toLowerCase()));
  }
  due = due.slice(0, limit);

  const started: {
    cliente_handle: string;
    analise_web_id?: string;
    job_id?: string;
    error?: string;
  }[] = [];

  for (const cfg of due) {
    const handle = cfg.cliente_handle;
    const { data: analise } = await supabase
      .from("analises_web")
      .select("id, url")
      .eq("cliente_handle", handle)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!analise?.id) {
      started.push({ cliente_handle: handle, error: "sem analise_web" });
      continue;
    }

    const result = await iniciarPresencaPipeline({
      analise_web_id: analise.id,
      cliente_handle: handle,
      modo: "refresh",
      force,
    });

    if (!result.ok || !result.job_id) {
      started.push({
        cliente_handle: handle,
        analise_web_id: analise.id,
        error: result.error || "falha pipeline",
      });
      continue;
    }

    await supabase
      .from("presenca_auto_config")
      .update({
        ultima_verificacao_em: new Date().toISOString(),
        ultimo_job_id: result.job_id,
        atualizado_em: new Date().toISOString(),
      })
      .eq("cliente_handle", handle);

    started.push({
      cliente_handle: handle,
      analise_web_id: analise.id,
      job_id: result.job_id,
    });
  }

  return NextResponse.json({
    ok: true,
    count: started.length,
    started,
  });
}
