/**
 * Presença digital: meta leve em analises_web.presenca + JSON completo por
 * ferramenta em public.presenca_canais.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const PRESENCA_CANAL_KEYS = [
  "google_meu_negocio",
  "tech_seo",
  "ai_visibility",
  "autoridade_busca",
  "meta_ads",
  "youtube",
  "instagram",
  "tiktok",
  "blog",
  "urls_internas",
  "plano_impacto",
  "percepcao_valor",
  "posicionamento",
  "audiencia_ideal",
  "midia_comparativo",
  "reclame_aqui",
] as const;

export type PresencaCanalKey = (typeof PRESENCA_CANAL_KEYS)[number];

function isStub(v: unknown): boolean {
  return Boolean(
    v && typeof v === "object" && !Array.isArray(v) && (v as { _canal?: boolean })._canal === true,
  );
}

/** Carrega payloads completos de uma ou mais ferramentas. */
export async function loadPresencaCanais(
  supabase: SupabaseClient,
  analiseWebId: string,
  chaves?: readonly string[],
): Promise<Record<string, unknown>> {
  // Tabela nova — tipagem Database ainda não regenerada
  const client = supabase as unknown as SupabaseClient<Record<string, unknown>>;
  let query = client
    .from("presenca_canais")
    .select("chave, dados")
    .eq("analise_web_id", analiseWebId);
  if (chaves?.length) query = query.in("chave", [...chaves]);

  const { data, error } = await query;
  if (error) {
    console.error("[presenca_canais]", error.message);
    return {};
  }
  const out: Record<string, unknown> = {};
  for (const row of (data as { chave?: string; dados?: unknown }[] | null) ?? []) {
    if (row.chave) out[row.chave] = row.dados;
  }
  return out;
}

/**
 * Junta meta leve + canais completos (mesmo shape antigo de `presenca`).
 * Use no admin/apresentação; depois passe por slimPresencaForUi.
 */
export async function loadPresencaMerged(
  supabase: SupabaseClient,
  analiseWebId: string,
  meta: Record<string, unknown> | null | undefined,
): Promise<Record<string, unknown>> {
  const base = meta && typeof meta === "object" ? { ...meta } : {};
  const canais = await loadPresencaCanais(supabase, analiseWebId);

  const merged: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(canais)) {
    merged[k] = v;
  }
  for (const k of PRESENCA_CANAL_KEYS) {
    if (merged[k] == null && base[k] != null && !isStub(base[k])) {
      merged[k] = base[k];
    }
  }
  return merged;
}
