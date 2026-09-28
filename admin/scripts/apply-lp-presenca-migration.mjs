#!/usr/bin/env node
/**
 * Aplica supabase/migrations/20260726_lp_presenca_conversas.sql
 * via Management API (precisa SUPABASE_ACCESS_TOKEN).
 *
 * Uso:
 *   export SUPABASE_ACCESS_TOKEN=sbp_...
 *   node scripts/apply-lp-presenca-migration.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_REF = "mblntoimrkfoocbztozb";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const sqlPath = resolve(
  root,
  "supabase/migrations/20260726_lp_presenca_conversas.sql",
);

function loadEnvLocal() {
  const p = resolve(root, ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function api(path, body) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${path} ${res.status}: ${text}`);
  }
  return text;
}

loadEnvLocal();

if (!process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
  console.error(
    "Falta SUPABASE_ACCESS_TOKEN.\n" +
      "Crie em: https://supabase.com/dashboard/account/tokens",
  );
  process.exit(1);
}

const query = readFileSync(sqlPath, "utf8");

try {
  await api("/database/migrations", {
    name: "20260726_lp_presenca_conversas",
    query,
  });
} catch (e) {
  console.warn("migrations endpoint falhou, tentando /database/query…");
  console.warn(String(e.message || e));
  await api("/database/query", { query });
}

await api("/database/query", { query: "notify pgrst, 'reload schema';" });

const check = await api("/database/query", {
  query: "select to_regclass('public.lp_presenca_conversas') as tbl;",
});
console.log("Migration ok em", PROJECT_REF, check);
