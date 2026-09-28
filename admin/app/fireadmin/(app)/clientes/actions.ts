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
    redirect(`/fireadmin/clientes/novo?error=${encodeURIComponent("Handle é obrigatório")}`);
  }

  const supabase = await createClient();
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
    redirect(`/fireadmin/clientes/novo?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("creditos_clientes").insert({
    cliente_handle: handle,
    saldo_atual: 0,
    creditos_mes: 0,
  });

  revalidatePath("/fireadmin/clientes");
  redirect(`/fireadmin/clientes/${encodeURIComponent(handle)}`);
}

export async function updateCliente(handle: string, formData: FormData) {
  const plano = str(formData, "plano") ?? "free";
  const status = str(formData, "status") ?? "ativo";
  const novoHandle = str(formData, "handle") ?? handle;

  if (!PLANOS_VALIDOS.includes(plano) || !STATUS_VALIDOS.includes(status)) {
    redirect(`/fireadmin/clientes/${encodeURIComponent(handle)}?error=${encodeURIComponent("Plano ou status inválido")}`);
  }
  if (!novoHandle) {
    redirect(`/fireadmin/clientes/${encodeURIComponent(handle)}?error=${encodeURIComponent("Handle não pode ficar vazio")}`);
  }

  const supabase = await createClient();
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
    redirect(`/fireadmin/clientes/${encodeURIComponent(handle)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/fireadmin/clientes/${handle}`);
  revalidatePath(`/fireadmin/clientes/${novoHandle}`);
  revalidatePath("/fireadmin/clientes");
  redirect(`/fireadmin/clientes/${encodeURIComponent(novoHandle)}`);
}

export async function deactivateCliente(handle: string) {
  const supabase = await createClient();
  await supabase.from("clientes").update({ status: "cancelado" }).eq("handle", handle);
  revalidatePath("/fireadmin/clientes");
  redirect("/fireadmin/clientes");
}

export async function ajustarCredito(handle: string, formData: FormData) {
  const tipo = str(formData, "tipo") ?? "bonus";
  const quantidade = Number(formData.get("quantidade") ?? 0);
  const descricao = str(formData, "descricao");

  if (!quantidade || Number.isNaN(quantidade)) {
    redirect(`/fireadmin/clientes/${encodeURIComponent(handle)}?error=${encodeURIComponent("Quantidade inválida")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("ajustar_creditos_manual", {
    p_cliente_handle: handle,
    p_tipo: tipo,
    p_quantidade: quantidade,
    p_descricao: descricao,
  });

  if (error) {
    redirect(`/fireadmin/clientes/${encodeURIComponent(handle)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/fireadmin/clientes/${handle}`);
  redirect(`/fireadmin/clientes/${encodeURIComponent(handle)}`);
}

export async function addConcorrente(clienteHandle: string, formData: FormData) {
  const handle = str(formData, "handle");
  if (!handle) {
    redirect(`/fireadmin/clientes/${encodeURIComponent(clienteHandle)}?error=${encodeURIComponent("Handle do concorrente é obrigatório")}`);
  }

  const supabase = await createClient();

  const { error: upsertError } = await supabase
    .from("concorrentes")
    .upsert(
      { handle, nome_completo: str(formData, "nome_completo"), site_externo: str(formData, "site_externo") },
      { onConflict: "handle" },
    );

  if (upsertError) {
    redirect(`/fireadmin/clientes/${encodeURIComponent(clienteHandle)}?error=${encodeURIComponent(upsertError.message)}`);
  }

  const { error: linkError } = await supabase
    .from("cliente_concorrentes")
    .upsert({ cliente_handle: clienteHandle, concorrente_handle: handle }, { onConflict: "cliente_handle,concorrente_handle" });

  if (linkError) {
    redirect(`/fireadmin/clientes/${encodeURIComponent(clienteHandle)}?error=${encodeURIComponent(linkError.message)}`);
  }

  revalidatePath(`/fireadmin/clientes/${clienteHandle}`);
  redirect(`/fireadmin/clientes/${encodeURIComponent(clienteHandle)}`);
}

export async function removeConcorrente(clienteHandle: string, concorrenteHandle: string) {
  const supabase = await createClient();
  await supabase
    .from("cliente_concorrentes")
    .delete()
    .eq("cliente_handle", clienteHandle)
    .eq("concorrente_handle", concorrenteHandle);

  revalidatePath(`/fireadmin/clientes/${clienteHandle}`);
  redirect(`/fireadmin/clientes/${encodeURIComponent(clienteHandle)}`);
}

export async function updatePresencaAutoConfig(handle: string, formData: FormData) {
  const ativoRaw = String(formData.get("presenca_auto_ativo") ?? "");
  const ativo = ativoRaw === "on" || ativoRaw === "true" || ativoRaw === "1";
  const intervalo = Number(str(formData, "presenca_intervalo_dias") ?? "15");
  if (![7, 15, 30].includes(intervalo)) {
    redirect(
      `/clientes/${encodeURIComponent(handle)}?error=${encodeURIComponent("Intervalo inválido (7, 15 ou 30)")}`,
    );
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from("presenca_auto_config").upsert(
    {
      cliente_handle: handle,
      ativo,
      intervalo_dias: intervalo,
      atualizado_em: now,
    },
    { onConflict: "cliente_handle" },
  );

  if (error) {
    redirect(`/fireadmin/clientes/${encodeURIComponent(handle)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/fireadmin/clientes/${handle}`);
  redirect(`/fireadmin/clientes/${encodeURIComponent(handle)}`);
}
