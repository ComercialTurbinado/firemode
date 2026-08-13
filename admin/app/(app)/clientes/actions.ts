"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";

const PLANOS_VALIDOS = ["free", "starter", "pro", "agency"];
const STATUS_VALIDOS = ["ativo", "pausado", "cancelado", "inadimplente", "trial"];

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function createCliente(formData: FormData) {
  const handle = str(formData, "handle");
  if (!handle) {
    redirect(`/clientes/novo?error=${encodeURIComponent("Handle é obrigatório")}`);
  }

  const supabase = createClient();
  const { error } = await supabase.from("clientes").insert({
    handle,
    nome_completo: str(formData, "nome_completo"),
    whatsapp: str(formData, "whatsapp"),
    email: str(formData, "email"),
    nicho: str(formData, "nicho"),
    plano: str(formData, "plano") ?? "free",
    status: "trial",
  });

  if (error) {
    redirect(`/clientes/novo?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("creditos_clientes").insert({
    cliente_handle: handle,
    saldo_atual: 0,
    creditos_mes: 0,
  });

  revalidatePath("/clientes");
  redirect(`/clientes/${encodeURIComponent(handle)}`);
}

export async function updateCliente(handle: string, formData: FormData) {
  const plano = str(formData, "plano") ?? "free";
  const status = str(formData, "status") ?? "ativo";
  const novoHandle = str(formData, "handle") ?? handle;

  if (!PLANOS_VALIDOS.includes(plano) || !STATUS_VALIDOS.includes(status)) {
    redirect(`/clientes/${encodeURIComponent(handle)}?error=${encodeURIComponent("Plano ou status inválido")}`);
  }
  if (!novoHandle) {
    redirect(`/clientes/${encodeURIComponent(handle)}?error=${encodeURIComponent("Handle não pode ficar vazio")}`);
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("clientes")
    .update({
      handle: novoHandle,
      nome_completo: str(formData, "nome_completo"),
      whatsapp: str(formData, "whatsapp"),
      email: str(formData, "email"),
      nicho: str(formData, "nicho"),
      plano,
      status,
      atualizado_em: new Date().toISOString(),
    })
    .eq("handle", handle);

  if (error) {
    redirect(`/clientes/${encodeURIComponent(handle)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/clientes/${handle}`);
  revalidatePath(`/clientes/${novoHandle}`);
  revalidatePath("/clientes");
  redirect(`/clientes/${encodeURIComponent(novoHandle)}`);
}

export async function deactivateCliente(handle: string) {
  const supabase = createClient();
  await supabase.from("clientes").update({ status: "cancelado" }).eq("handle", handle);
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function ajustarCredito(handle: string, formData: FormData) {
  const tipo = str(formData, "tipo") ?? "bonus";
  const quantidade = Number(formData.get("quantidade") ?? 0);
  const descricao = str(formData, "descricao");

  if (!quantidade || Number.isNaN(quantidade)) {
    redirect(`/clientes/${encodeURIComponent(handle)}?error=${encodeURIComponent("Quantidade inválida")}`);
  }

  const supabase = createClient();
  const { error } = await supabase.rpc("ajustar_creditos_manual", {
    p_cliente_handle: handle,
    p_tipo: tipo,
    p_quantidade: quantidade,
    p_descricao: descricao,
  });

  if (error) {
    redirect(`/clientes/${encodeURIComponent(handle)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/clientes/${handle}`);
  redirect(`/clientes/${encodeURIComponent(handle)}`);
}

export async function addConcorrente(clienteHandle: string, formData: FormData) {
  const handle = str(formData, "handle");
  if (!handle) {
    redirect(`/clientes/${encodeURIComponent(clienteHandle)}?error=${encodeURIComponent("Handle do concorrente é obrigatório")}`);
  }

  const supabase = createClient();

  const { error: upsertError } = await supabase
    .from("concorrentes")
    .upsert(
      { handle, nome_completo: str(formData, "nome_completo"), site_externo: str(formData, "site_externo") },
      { onConflict: "handle" },
    );

  if (upsertError) {
    redirect(`/clientes/${encodeURIComponent(clienteHandle)}?error=${encodeURIComponent(upsertError.message)}`);
  }

  const { error: linkError } = await supabase
    .from("cliente_concorrentes")
    .upsert({ cliente_handle: clienteHandle, concorrente_handle: handle }, { onConflict: "cliente_handle,concorrente_handle" });

  if (linkError) {
    redirect(`/clientes/${encodeURIComponent(clienteHandle)}?error=${encodeURIComponent(linkError.message)}`);
  }

  revalidatePath(`/clientes/${clienteHandle}`);
  redirect(`/clientes/${encodeURIComponent(clienteHandle)}`);
}

export async function removeConcorrente(clienteHandle: string, concorrenteHandle: string) {
  const supabase = createClient();
  await supabase
    .from("cliente_concorrentes")
    .delete()
    .eq("cliente_handle", clienteHandle)
    .eq("concorrente_handle", concorrenteHandle);

  revalidatePath(`/clientes/${clienteHandle}`);
  redirect(`/clientes/${encodeURIComponent(clienteHandle)}`);
}
