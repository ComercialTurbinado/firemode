import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Lista pedidos de proposta (admin). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const analiseId = searchParams.get("analise_web_id");
  if (!analiseId) {
    return NextResponse.json({ error: "analise_web_id obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apresentacao_propostas")
    .select("id, modo, canais, session_key, criado_em")
    .eq("analise_web_id", analiseId)
    .order("criado_em", { ascending: false })
    .limit(40);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ propostas: data ?? [] });
}
