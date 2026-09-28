/**
 * Clientes Supabase do admin-firemode
 * Projeto original: mblntoimrkfoocbztozb (mesmo do content-machine)
 *
 * - createClient() → só em Server Components, Route Handlers, actions
 * - createBrowserClient() → Client Components (RLS / anon)
 * - Teleprompter → lib/teleprompter.ts (outro projeto)
 */

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getEnvVar } from "@/lib/ssm-env";

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

/** URL pública do projeto Firemode — fallback se Amplify não injetar NEXT_PUBLIC_* no Lambda. */
const FIREMODE_SUPABASE_URL = "https://mblntoimrkfoocbztozb.supabase.co";

/** Server / API — usa service_role (bypassa RLS). Nunca importar em Client Components. */
export async function createClient(): Promise<SupabaseClient<Database>> {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    (await getEnvVar("NEXT_PUBLIC_SUPABASE_URL")) ||
    (await getEnvVar("SUPABASE_URL")) ||
    FIREMODE_SUPABASE_URL;
  const key = await getEnvVar("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente (process.env + SSM Amplify)");
  }
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Browser / client — só anon key (respeita RLS) */
export function createBrowserClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}
