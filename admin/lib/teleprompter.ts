import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getEnvVar } from "./ssm-env";

export async function createTeleprompterClient() {
  const url = await getEnvVar("TP_DB_URL");
  const key = await getEnvVar("TP_DB_KEY");
  if (!url || !key) {
    throw new Error(
      "Teleprompter Supabase URL/key ausentes (TP_DB_URL + TP_DB_KEY)",
    );
  }
  return createSupabaseClient(url, key);
}
