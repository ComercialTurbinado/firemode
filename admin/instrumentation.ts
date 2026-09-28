/**
 * Roda uma vez no boot do servidor (antes de qualquer requisição).
 * A Amplify não injeta as env vars configuradas no Console nesse Lambda
 * (bug confirmado da plataforma) — aqui buscamos direto no SSM e
 * preenchemos process.env, sem precisar mexer em cada call site.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const fnName = process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (!fnName) return; // dev local: .env.local já tem tudo

  const appIdMatch = fnName.match(/^Compute-([a-z0-9]+)-/);
  if (!appIdMatch) return;

  const { SSMClient, GetParametersByPathCommand } = await import("@aws-sdk/client-ssm");
  const client = new SSMClient({ region: process.env.AWS_REGION || "us-east-1" });
  const branch = process.env.AWS_BRANCH || "main";
  const path = `/amplify/${appIdMatch[1]}/${branch}/`;

  let nextToken: string | undefined;
  try {
    do {
      const res = await client.send(
        new GetParametersByPathCommand({ Path: path, WithDecryption: true, NextToken: nextToken }),
      );
      for (const p of res.Parameters ?? []) {
        const name = p.Name?.split("/").pop();
        if (name && p.Value != null && !process.env[name]) {
          process.env[name] = p.Value;
        }
      }
      nextToken = res.NextToken;
    } while (nextToken);

    // URL pública do Supabase (não costuma estar no SSM) — evita createClient quebrar no Lambda
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
      process.env.SUPABASE_URL = "https://mblntoimrkfoocbztozb.supabase.co";
    }
  } catch {
    // segue sem os secrets do SSM; guards existentes vao acusar o que faltar
  }
}
