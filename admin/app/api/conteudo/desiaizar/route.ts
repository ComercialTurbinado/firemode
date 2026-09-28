import { NextRequest, NextResponse } from "next/server";
import { desiaizarPeca } from "@/lib/content-machine";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { peca_id?: string } | null;
  const pecaId = body?.peca_id?.trim();
  if (!pecaId) {
    return NextResponse.json({ error: "Informe peca_id." }, { status: 400 });
  }

  const result = await desiaizarPeca(pecaId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Falha na desIAização" }, { status: 502 });
  }
  return NextResponse.json(result);
}
