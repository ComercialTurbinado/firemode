import { NextRequest, NextResponse } from "next/server";
import { iniciarPresencaPipeline } from "@/lib/content-machine";
import {
  normalizeInstagramHandle,
  normalizeSiteUrl,
} from "@/lib/vender-presenca-lead";

/**
 * Disparo público (LP): cliente manda o site → sequência automática.
 * Site novo = full; domínio já no banco = refresh (TTL).
 * Fire-and-forget: devolve job_id sem esperar o fim.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    site?: string;
    url?: string;
    instagram?: string;
    cliente_handle?: string;
  } | null;

  const site = normalizeSiteUrl(body?.site || body?.url || "");
  if (!site) {
    return NextResponse.json(
      { error: "Informe um site válido (ex.: empresa.com.br)." },
      { status: 400 },
    );
  }

  const handle =
    normalizeInstagramHandle(body?.instagram || body?.cliente_handle || "") ||
    undefined;

  const result = await iniciarPresencaPipeline({
    url: site,
    cliente_handle: handle,
    // modo null → CM decide full vs refresh pelo domínio
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Falha ao iniciar análise automática" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    job_id: result.job_id,
    modo: result.modo,
    site,
  });
}
