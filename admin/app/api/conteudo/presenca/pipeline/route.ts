import { NextRequest, NextResponse } from "next/server";
import { iniciarPresencaPipeline } from "@/lib/content-machine";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    analise_web_id?: string;
    url?: string;
    cliente_handle?: string;
    modo?: "full" | "refresh" | null;
    force?: boolean;
  } | null;

  const analiseId = body?.analise_web_id?.trim() || undefined;
  const url = body?.url?.trim() || undefined;
  if (!analiseId && !url) {
    return NextResponse.json(
      { error: "Informe analise_web_id ou url." },
      { status: 400 },
    );
  }

  const result = await iniciarPresencaPipeline({
    analise_web_id: analiseId,
    url,
    cliente_handle: body?.cliente_handle?.trim() || undefined,
    modo: body?.modo ?? null,
    force: Boolean(body?.force),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Falha ao iniciar pipeline de presença" },
      { status: 502 },
    );
  }

  return NextResponse.json(result);
}
