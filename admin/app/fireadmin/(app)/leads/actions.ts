"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function createLead(formData: FormData) {
  const nome = str(formData, "nome");
  if (!nome) {
    redirect(`/fireadmin/leads/novo?error=${encodeURIComponent("Nome é obrigatório")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    nome,
    empresa: str(formData, "empresa"),
    whatsapp: str(formData, "whatsapp"),
    instagram: str(formData, "instagram"),
    cupom_utilizado: str(formData, "cupom_utilizado"),
  });

  if (error) {
    redirect(`/fireadmin/leads/novo?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/fireadmin/leads");
  redirect("/fireadmin/leads");
}

export async function deleteLead(id: number) {
  const supabase = await createClient();
  await supabase.from("leads").delete().eq("id", id);
  revalidatePath("/fireadmin/leads");
  redirect("/fireadmin/leads");
}

export async function convertLeadToCliente(id: number, formData: FormData) {
  const handle = String(formData.get("handle") ?? "").trim();
  if (!handle) {
    redirect(`/fireadmin/leads?error=${encodeURIComponent("Handle é obrigatório para converter")}`);
  }

  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) {
    redirect(`/fireadmin/leads?error=${encodeURIComponent("Lead não encontrado")}`);
  }

  const { error } = await supabase.from("clientes").insert({
    handle,
    nome_completo: lead!.nome,
    username: lead!.instagram,
    whatsapp: lead!.whatsapp,
    plano: "free",
    status: "trial",
  });

  if (error) {
    redirect(`/fireadmin/leads?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("creditos_clientes").insert({ cliente_handle: handle, saldo_atual: 0, creditos_mes: 0 });
  await supabase.from("leads").delete().eq("id", id);

  revalidatePath("/fireadmin/leads");
  revalidatePath("/fireadmin/clientes");
  redirect(`/fireadmin/clientes/${encodeURIComponent(handle)}`);
}
