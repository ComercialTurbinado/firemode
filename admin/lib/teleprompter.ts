import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createTeleprompterClient() {
  return createSupabaseClient(
    process.env.TELEPROMPTER_SUPABASE_URL!,
    process.env.TELEPROMPTER_SUPABASE_SERVICE_ROLE_KEY!,
  );
}
