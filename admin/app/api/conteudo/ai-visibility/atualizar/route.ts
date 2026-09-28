import { NextRequest, NextResponse } from "next/server";
import { atualizarAiVisibility } from "@/lib/content-machine";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    analise_web_id?: string;
    prompts?: string[];
  } | null;
  const id = body?.analise_web_id?.trim();
  if (!id) {
    return NextResponse.json({ error: "Informe analise_web_id." }, { status: 400 });
  }

  const result = await atualizarAiVisibility(id, body?.prompts);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Falha na auditoria de visibilidade em IA" },
      { status: 502 },
    );
  }
  return NextResponse.json(result);
}
