"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function num(formData: FormData, key: string): number {
  return Number(formData.get(key) ?? 0) || 0;
}

export async function createPlano(formData: FormData) {
  const slug = str(formData, "slug");
  if (!slug) {
    redirect(`/planos/novo?error=${encodeURIComponent("Slug é obrigatório")}`);
  }

  const supabase = createClient();
  const { error } = await supabase.from("planos").insert({
    slug,
    nome: str(formData, "nome") ?? slug,
    preco_mensal: num(formData, "preco_mensal"),
    creditos_mes: num(formData, "creditos_mes"),
    preco_credito_extra: num(formData, "preco_credito_extra"),
    max_contas: num(formData, "max_contas") || 1,
    edicao_video: bool(formData, "edicao_video"),
    relatorio_mensal: bool(formData, "relatorio_mensal"),
    alertas_diarios: bool(formData, "alertas_diarios"),
    descricao: str(formData, "descricao"),
    ativo: true,
  });

  if (error) {
    redirect(`/planos/novo?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/planos");
  redirect("/planos");
}

export async function updatePlano(slug: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("planos")
    .update({
      nome: str(formData, "nome") ?? slug,
      preco_mensal: num(formData, "preco_mensal"),
      creditos_mes: num(formData, "creditos_mes"),
      preco_credito_extra: num(formData, "preco_credito_extra"),
      max_contas: num(formData, "max_contas") || 1,
      edicao_video: bool(formData, "edicao_video"),
      relatorio_mensal: bool(formData, "relatorio_mensal"),
      alertas_diarios: bool(formData, "alertas_diarios"),
      descricao: str(formData, "descricao"),
      ativo: bool(formData, "ativo"),
    })
    .eq("slug", slug);

  if (error) {
    redirect(`/planos/${encodeURIComponent(slug)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/planos");
  redirect("/planos");
}
