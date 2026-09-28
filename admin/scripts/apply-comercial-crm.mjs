#!/usr/bin/env node
/** Aplica somente a migration do CRM pela Management API do Supabase. */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_REF = "mblntoimrkfoocbztozb";
const currentDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(currentDir, "..");
const migrationName = "20260908_comercial_crm";
const sqlPath = resolve(root, `supabase/migrations/${migrationName}.sql`);

for (const name of [".env.local", ".env"]) {
  const path = resolve(root, name);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
if (!token) {
  console.error("Falta SUPABASE_ACCESS_TOKEN no .env ou .env.local.");
  process.exit(1);
}

async function api(path, body) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  if (!response.ok) throw new Error(`${path} ${response.status}: ${responseText}`);
  return responseText;
}

const query = readFileSync(sqlPath, "utf8");
try {
  await api("/database/migrations", { name: migrationName, query });
} catch (error) {
  console.warn("Endpoint de migrations indisponível; tentando execução idempotente direta.");
  console.warn(String(error instanceof Error ? error.message : error));
  await api("/database/query", { query });
}

await api("/database/query", { query: "notify pgrst, 'reload schema';" });
const check = await api("/database/query", {
  query: "select table_name from information_schema.tables where table_schema='public' and table_name like 'crm_%' order by table_name;",
});
console.log("CRM aplicado:", check);
