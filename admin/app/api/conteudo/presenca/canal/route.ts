import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { slimPresencaForUi } from "@/lib/presenca-slim";
import { PRESENCA_CANAL_KEYS } from "@/lib/presenca-store";

export async function GET(req: NextRequest) {
  const analiseId = req.nextUrl.searchParams.get("analise_web_id")?.trim();
  const chave = req.nextUrl.searchParams.get("chave")?.trim();
  if (!analiseId || !chave) {
    return NextResponse.json({ error: "Informe analise_web_id e chave." }, { status: 400 });
  }
  if (!(PRESENCA_CANAL_KEYS as readonly string[]).includes(chave)) {
    return NextResponse.json({ error: "Chave de canal inválida." }, { status: 400 });
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("presenca_canais")
    .select("dados")
    .eq("analise_web_id", analiseId)
    .eq("chave", chave)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: true, chave, dados: null });
  }

  const slimmed = slimPresencaForUi({ [chave]: data.dados });
  return NextResponse.json({
    ok: true,
    chave,
    dados: slimmed[chave] ?? data.dados,
  });
}
