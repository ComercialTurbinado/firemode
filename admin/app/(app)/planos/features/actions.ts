"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function createFeature(formData: FormData) {
  const slug = str(formData, "slug");
  if (!slug) {
    redirect(`/planos/features/novo?error=${encodeURIComponent("Slug é obrigatório")}`);
  }

  const supabase = createClient();
  const { error } = await supabase.from("features_creditos").insert({
    slug,
    nome: str(formData, "nome") ?? slug,
    descricao: str(formData, "descricao"),
    custo_creditos: Number(formData.get("custo_creditos") ?? 0) || 0,
    categoria: str(formData, "categoria"),
    ativo: true,
  });

  if (error) {
    redirect(`/planos/features/novo?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/planos/features");
  redirect("/planos/features");
}

export async function updateFeature(slug: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("features_creditos")
    .update({
      nome: str(formData, "nome") ?? slug,
      descricao: str(formData, "descricao"),
      custo_creditos: Number(formData.get("custo_creditos") ?? 0) || 0,
      categoria: str(formData, "categoria"),
      ativo: formData.get("ativo") === "on",
    })
    .eq("slug", slug);

  if (error) {
    redirect(`/planos/features/${encodeURIComponent(slug)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/planos/features");
  redirect("/planos/features");
}
