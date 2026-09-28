import { NextResponse } from "next/server";
import { statusJobConteudo } from "@/lib/content-machine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "job id obrigatório" }, { status: 400 });
  }

  try {
    const data = await statusJobConteudo(id);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao consultar job";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
