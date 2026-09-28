"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase";

function cleanDomain(raw: string): string {
  let d = raw.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/^www\./, "");
  d = d.split("/")[0]?.split("?")[0] ?? d;
  return d;
}

function revalidate(analiseId: string) {
  revalidatePath(`/fireadmin/conteudo/${analiseId}`);
  revalidatePath(`/fireadmin/conteudo/${analiseId}/apresentacao`);
}

export async function addConcorrente(input: {
  analise_web_id: string;
  nome?: string;
  dominio: string;
}): Promise<{ ok: boolean; error?: string }> {
  const analiseId = input.analise_web_id?.trim();
  const dominio = cleanDomain(input.dominio || "");
  if (!analiseId || !dominio) {
    return { ok: false, error: "Informe domínio." };
  }

  const supabase = await createClient();
  const base = {
    analise_web_id: analiseId,
    dominio,
    nome: (input.nome || "").trim() || dominio,
    tipo: "concorrente",
    aparicoes: 0,
    fora_da_serp: true,
    porque: "Adicionado manualmente",
  };

  let { error } = await supabase.from("concorrentes_web").insert({
    ...base,
    fonte: ["manual"],
    status: "confirmado",
    handles: {},
    meta_extra: {},
  } as never);

  // Migration ainda não aplicada — insert legado
  if (error && /fonte|status|handles|meta_extra|column/i.test(error.message)) {
    ({ error } = await supabase.from("concorrentes_web").insert(base as never));
  }

  if (error) return { ok: false, error: error.message };
  revalidate(analiseId);
  return { ok: true };
}

export async function updateConcorrente(input: {
  id: string;
  analise_web_id: string;
  nome?: string;
  dominio: string;
}): Promise<{ ok: boolean; error?: string }> {
  const id = input.id?.trim();
  const analiseId = input.analise_web_id?.trim();
  const dominio = cleanDomain(input.dominio || "");
  if (!id || !analiseId || !dominio) {
    return { ok: false, error: "Dados incompletos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("concorrentes_web")
    .update({
      dominio,
      nome: (input.nome || "").trim() || dominio,
    } as never)
    .eq("id", id)
    .eq("analise_web_id", analiseId);

  if (error) return { ok: false, error: error.message };
  revalidate(analiseId);
  return { ok: true };
}

export async function setConcorrenteStatus(input: {
  id: string;
  analise_web_id: string;
  status: "confirmado" | "sugerido" | "rejeitado";
}): Promise<{ ok: boolean; error?: string }> {
  const id = input.id?.trim();
  const analiseId = input.analise_web_id?.trim();
  if (!id || !analiseId) return { ok: false, error: "Dados incompletos." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("concorrentes_web")
    .update({ status: input.status } as never)
    .eq("id", id)
    .eq("analise_web_id", analiseId);

  if (error) {
    if (/status|column/i.test(error.message)) {
      return {
        ok: false,
        error: "Rode a migration 20260727_concorrentes_unificados antes de confirmar sugestões.",
      };
    }
    return { ok: false, error: error.message };
  }
  revalidate(analiseId);
  return { ok: true };
}

export async function deleteConcorrente(input: {
  id: string;
  analise_web_id: string;
}): Promise<{ ok: boolean; error?: string }> {
  const id = input.id?.trim();
  const analiseId = input.analise_web_id?.trim();
  if (!id || !analiseId) {
    return { ok: false, error: "Dados incompletos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("concorrentes_web")
    .delete()
    .eq("id", id)
    .eq("analise_web_id", analiseId);

  if (error) return { ok: false, error: error.message };
  revalidate(analiseId);
  return { ok: true };
}
