#!/usr/bin/env node
/**
 * Aplica supabase/migrations/20260802_presenca_auto_config.sql
 * via Management API (precisa SUPABASE_ACCESS_TOKEN).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_REF = "mblntoimrkfoocbztozb";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const sqlPath = resolve(root, "supabase/migrations/20260802_presenca_auto_config.sql");

function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const p = resolve(root, name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m || process.env[m[1]]) continue;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
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
  if (!res.ok) throw new Error(`${path} ${res.status}: ${text}`);
  return text;
}

loadEnvFiles();
if (!process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
  console.error("Falta SUPABASE_ACCESS_TOKEN no .env ou .env.local.");
  process.exit(1);
}

const query = readFileSync(sqlPath, "utf8");
try {
  await api("/database/migrations", {
    name: "20260802_presenca_auto_config",
    query,
  });
} catch (e) {
  console.warn("migrations endpoint falhou, tentando /database/query…");
  console.warn(String(e.message || e));
  await api("/database/query", { query });
}
await api("/database/query", { query: "notify pgrst, 'reload schema';" });
const check = await api("/database/query", {
  query:
    "select table_name from information_schema.tables where table_schema='public' and table_name='presenca_auto_config';",
});
console.log("Migration ok:", check);
