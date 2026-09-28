import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { dispararConteudo } from "@/lib/content-machine";
import { buildTrilhaConteudo } from "@/lib/trilha-conteudo";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    pauta_id?: string;
    cliente_handle?: string;
    analise_web_id?: string;
  } | null;

  const pauta_id = body?.pauta_id?.trim();
  const cliente_handle = body?.cliente_handle?.trim();
  const analise_web_id = body?.analise_web_id?.trim();

  if (!pauta_id || !cliente_handle) {
    return NextResponse.json(
      { error: "Informe pauta_id e cliente_handle." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  let analise: { diagnostico?: Record<string, unknown> | null; presenca?: Record<string, unknown> | null } | null = null;

  if (analise_web_id) {
    const { data } = await supabase
      .from("analises_web")
      .select("diagnostico, presenca")
      .eq("id", analise_web_id)
      .maybeSingle();
    analise = data;
  } else {
    const { data } = await supabase
      .from("analises_web")
      .select("diagnostico, presenca")
      .eq("cliente_handle", cliente_handle)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();
    analise = data;
  }

  if (!analise) {
    return NextResponse.json(
      { error: "Nenhuma análise web encontrada para este cliente. Rode a análise completa antes." },
      { status: 400 },
    );
  }

  const trilha = buildTrilhaConteudo(
    (analise.diagnostico ?? {}) as Record<string, unknown>,
    (analise.presenca ?? {}) as Parameters<typeof buildTrilhaConteudo>[1],
  );
  if (!trilha.pronto) {
    return NextResponse.json(
      {
        error: `Trilha incompleta — complete antes de criar: ${trilha.faltantes.join("; ")}`,
        faltantes: trilha.faltantes,
      },
      { status: 409 },
    );
  }

  try {
    const data = await dispararConteudo({ pauta_id, cliente_handle });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao disparar conteúdo";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
