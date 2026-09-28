import { NextResponse } from "next/server";
import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";
import { getEnvVar } from "@/lib/ssm-env";
import { createClient } from "@/lib/supabase";

export async function GET() {
  const fnName = process.env.AWS_LAMBDA_FUNCTION_NAME || null;
  const appIdMatch = fnName?.match(/^Compute-([a-z0-9]+)-/) ?? null;
  const appId = appIdMatch ? appIdMatch[1] : null;
  const branch = process.env.AWS_BRANCH || "main";
  const path = appId ? `/amplify/${appId}/${branch}/` : null;

  let paramNames: string[] = [];
  let error: string | null = null;
  try {
    if (path) {
      const client = new SSMClient({ region: process.env.AWS_REGION || "us-east-1" });
      const res = await client.send(
        new GetParametersByPathCommand({ Path: path, WithDecryption: false }),
      );
      paramNames = (res.Parameters ?? []).map((p) => p.Name ?? "?");
    }
  } catch (e) {
    error = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }

  const loadedIntoProcessEnv = [
    "SUPABASE_SERVICE_ROLE_KEY",
    "ADMIN_PASSWORD",
    "CONTENT_MACHINE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL",
    "TP_DB_URL",
    "TP_DB_KEY",
    "TELEPROMPTER_WEBHOOK_SECRET",
  ].filter((k) => Boolean(process.env[k]));

  // Resolve via SSM fallback (sem expor valores)
  let cmHost: string | null = null;
  let cmReachable: boolean | null = null;
  let cmStatus: number | null = null;
  let cmError: string | null = null;
  try {
    const cm = await getEnvVar("CONTENT_MACHINE_URL");
    if (cm) {
      try {
        cmHost = new URL(cm).host;
      } catch {
        cmHost = "(url inválida)";
      }
      try {
        const r = await fetch(cm.replace(/\/$/, "") + "/", {
          signal: AbortSignal.timeout(8_000),
        });
        cmStatus = r.status;
        cmReachable = r.ok;
      } catch (e) {
        cmReachable = false;
        cmError = e instanceof Error ? e.message : String(e);
      }
    }
  } catch (e) {
    cmError = e instanceof Error ? e.message : String(e);
  }

  let supabaseOk: boolean | null = null;
  let supabaseError: string | null = null;
  let supabaseSample: string | null = null;
  try {
    const sb = await createClient();
    const { data, error: qErr } = await sb
      .from("analises_web")
      .select("id, dominio")
      .eq("id", "85087ee2-26be-415b-8fff-4d1cb68d8076")
      .maybeSingle();
    if (qErr) {
      supabaseOk = false;
      supabaseError = qErr.message;
    } else {
      supabaseOk = Boolean(data);
      supabaseSample = data?.dominio ?? null;
    }
  } catch (e) {
    supabaseOk = false;
    supabaseError = e instanceof Error ? e.message : String(e);
  }

  const hasPublicUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const hasSsmUrl = Boolean(
    (await getEnvVar("SUPABASE_URL")) || (await getEnvVar("NEXT_PUBLIC_SUPABASE_URL")),
  );

  return NextResponse.json({
    fnName,
    appId,
    branch,
    path,
    paramCount: paramNames.length,
    paramNames,
    loadedIntoProcessEnv,
    hasPublicUrl,
    hasSsmUrl,
    contentMachine: { host: cmHost, reachable: cmReachable, status: cmStatus, error: cmError },
    supabase: { ok: supabaseOk, sample: supabaseSample, error: supabaseError },
    codeVersion: "lazy-canais-v2",
    error,
  });
}
