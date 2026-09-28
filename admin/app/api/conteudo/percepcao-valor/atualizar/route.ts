import { NextRequest, NextResponse } from "next/server";
import { atualizarPercepcaoValor } from "@/lib/content-machine";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { analise_web_id?: string } | null;
  const id = body?.analise_web_id?.trim();
  if (!id) {
    return NextResponse.json({ error: "Informe analise_web_id." }, { status: 400 });
  }

  const result = await atualizarPercepcaoValor(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Falha na auditoria de percepção" }, { status: 502 });
  }
  return NextResponse.json(result);
}
