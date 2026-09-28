import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";

let cache: Record<string, string> | null = null;
let inflight: Promise<Record<string, string>> | null = null;

function resolveAppId(): string | null {
  const fnName = process.env.AWS_LAMBDA_FUNCTION_NAME || "";
  const match = fnName.match(/^Compute-([a-z0-9]+)-/);
  return match ? match[1] : null;
}

async function fetchAll(): Promise<Record<string, string>> {
  const appId = resolveAppId();
  if (!appId) return {};

  const branch = process.env.AWS_BRANCH || "main";
  const client = new SSMClient({ region: process.env.AWS_REGION || "us-east-1" });
  const result: Record<string, string> = {};
  let nextToken: string | undefined;

  do {
    const res = await client.send(
      new GetParametersByPathCommand({
        Path: `/amplify/${appId}/${branch}/`,
        WithDecryption: true,
        NextToken: nextToken,
      }),
    );
    for (const p of res.Parameters ?? []) {
      const name = p.Name?.split("/").pop();
      if (name && p.Value != null) result[name] = p.Value;
    }
    nextToken = res.NextToken;
  } while (nextToken);

  return result;
}

/** Lê uma env var; se ausente no process.env (bug de injeção da Amplify), busca direto no SSM. */
export async function getEnvVar(name: string): Promise<string | undefined> {
  const direct = process.env[name]?.trim();
  if (direct) return direct;

  if (!inflight) {
    inflight = fetchAll().catch((err) => {
      inflight = null;
      throw err;
    });
  }
  if (!cache) cache = await inflight;
  return cache[name]?.trim();
}
