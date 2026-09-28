import { NextRequest, NextResponse } from "next/server";
import { atualizarGmb } from "@/lib/content-machine";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    analise_web_id?: string;
    place_id?: string;
    refazer_busca?: boolean;
  } | null;
  const id = body?.analise_web_id?.trim();
  if (!id) {
    return NextResponse.json({ error: "Informe analise_web_id." }, { status: 400 });
  }

  try {
    const result = await atualizarGmb(id, body?.place_id?.trim() || null, {
      refazer_busca: Boolean(body?.refazer_busca),
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Falha na auditoria GMB" }, { status: 502 });
    }
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno ao atualizar GMB";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
