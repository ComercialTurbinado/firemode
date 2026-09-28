import { NextRequest, NextResponse } from "next/server";
import { atualizarTechSeo } from "@/lib/content-machine";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { analise_web_id?: string } | null;
  const id = body?.analise_web_id?.trim();
  if (!id) {
    return NextResponse.json({ error: "Informe analise_web_id." }, { status: 400 });
  }

  const result = await atualizarTechSeo(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Falha na auditoria Tech/SEO" }, { status: 502 });
  }
  return NextResponse.json(result);
}
