import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import {
  carregarPayloadClientePdf,
  htmlParaPdfBuffer,
} from "@/lib/cliente-apresentacao-pdf";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const payload = await carregarPayloadClientePdf(supabase, id);
    const pdf = htmlParaPdfBuffer(payload.html, payload.filename.replace(/\.pdf$/i, ""));

    if (!pdf) {
      // Fallback: HTML para o browser abrir e o usuário salvar/imprimir
      return new NextResponse(payload.html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="${payload.filename.replace(/\.pdf$/i, ".html")}"`,
          "X-Firemode-Pdf": "fallback-html",
        },
      });
    }

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${payload.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao gerar PDF";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
