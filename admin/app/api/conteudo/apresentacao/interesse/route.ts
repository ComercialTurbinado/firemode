import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Lista canais marcados (session_key opcional; default agrega todos se omitido no admin). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const analiseId = searchParams.get("analise_web_id");
  const sessionKey = searchParams.get("session_key");
  if (!analiseId) {
    return NextResponse.json({ error: "analise_web_id obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();
  let q = supabase
    .from("apresentacao_interesses")
    .select("id, canal_id, canal_label, marcado, atualizado_em, session_key")
    .eq("analise_web_id", analiseId)
    .eq("marcado", true)
    .order("atualizado_em", { ascending: false });

  if (sessionKey) q = q.eq("session_key", sessionKey);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ interesses: data ?? [] });
}

/** Marca / desmarca um canal. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const analiseId = String(body.analise_web_id || "").trim();
  const canalId = String(body.canal_id || "").trim();
  const canalLabel = String(body.canal_label || canalId).trim();
  const sessionKey = String(body.session_key || "default").trim().slice(0, 80);
  const marcado = body.marcado !== false;

  if (!analiseId || !canalId) {
    return NextResponse.json({ error: "analise_web_id e canal_id obrigatórios" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apresentacao_interesses")
    .upsert(
      {
        analise_web_id: analiseId,
        canal_id: canalId,
        canal_label: canalLabel,
        session_key: sessionKey,
        marcado,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "analise_web_id,canal_id,session_key" },
    )
    .select("id, canal_id, canal_label, marcado, atualizado_em")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, interesse: data });
}
