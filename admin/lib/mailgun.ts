import { createHmac, timingSafeEqual } from "node:crypto";

export type SendMailInput = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  headers?: Record<string, string>;
};

const DEFAULT_BASE_URL = "https://api.mailgun.net";

function env(name: string): string | undefined {
  let value = process.env[name]?.trim();
  if (!value) return undefined;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value || undefined;
}

function config() {
  const apiKey = env("MAILGUN_API_KEY");
  const domain = env("MAILGUN_DOMAIN");
  const from = env("MAILGUN_FROM");
  const baseUrl = (env("MAILGUN_BASE_URL") || DEFAULT_BASE_URL).replace(/\/$/, "");
  if (!apiKey || !domain || !from) {
    throw new Error("MAILGUN_API_KEY, MAILGUN_DOMAIN e MAILGUN_FROM são obrigatórios.");
  }
  return { apiKey, domain, from, baseUrl };
}

export function mailgunMissingEnv(): string[] {
  return ["MAILGUN_API_KEY", "MAILGUN_DOMAIN", "MAILGUN_FROM"].filter((key) => !env(key));
}

export function isMailgunConfigured(): boolean {
  return mailgunMissingEnv().length === 0;
}

export function mailgunFromAddress(): string {
  return env("MAILGUN_FROM") || "Firemode <comercial@firemode.com.br>";
}

function authorization(apiKey: string): string {
  return `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`;
}

export async function sendMail(input: SendMailInput): Promise<{ id: string; message: string }> {
  if (!input.text && !input.html) throw new Error("Informe o corpo do e-mail.");
  const { apiKey, domain, from, baseUrl } = config();
  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  if (!recipients.length) throw new Error("Destinatário ausente.");

  const body = new FormData();
  body.set("from", input.from?.trim() || from);
  recipients.forEach((recipient) => body.append("to", recipient));
  body.set("subject", input.subject);
  if (input.text) body.set("text", input.text);
  if (input.html) body.set("html", input.html);
  Object.entries(input.headers ?? {}).forEach(([key, value]) => {
    if (key.trim() && value) body.set(`h:${key}`, value);
  });

  const response = await fetch(`${baseUrl}/v3/${domain}/messages`, {
    method: "POST",
    headers: { Authorization: authorization(apiKey) },
    body,
  });
  const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!response.ok) throw new Error(payload.message || `Mailgun recusou o envio (${response.status}).`);
  return { id: String(payload.id ?? ""), message: String(payload.message ?? "Queued") };
}

function safeHexEqual(a: string, b: string): boolean {
  try {
    const left = Buffer.from(a, "hex");
    const right = Buffer.from(b, "hex");
    return left.length > 0 && left.length === right.length && timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function verifyMailgunWebhook(input: {
  timestamp?: string;
  token?: string;
  signature?: string;
}): boolean {
  const timestamp = String(input.timestamp ?? "").trim();
  const token = String(input.token ?? "").trim();
  const signature = String(input.signature ?? "").trim();
  if (!timestamp || !token || !signature) return false;
  const unix = Number(timestamp);
  if (!Number.isFinite(unix) || Math.abs(Date.now() / 1000 - unix) > 15 * 60) return false;
  const keys = [env("MAILGUN_WEBHOOK_SIGNING_KEY"), env("MAILGUN_API_KEY")]
    .filter((key): key is string => Boolean(key));
  return keys.some((key) => {
    const legacy = createHmac("sha256", key).update(timestamp + token).digest("hex");
    const dotted = createHmac("sha256", key).update(`${timestamp}.${token}`).digest("hex");
    return safeHexEqual(legacy, signature) || safeHexEqual(dotted, signature);
  });
}

export type StoredMailgunMessage = {
  from?: string;
  sender?: string;
  recipient?: string;
  subject?: string;
  bodyPlain?: string;
  strippedText?: string;
  bodyHtml?: string;
  strippedHtml?: string;
  messageId?: string;
  inReplyTo?: string;
};

function mailgunStorageUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && /(^|\.)mailgun\.net$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function headerValue(headers: unknown, name: string): string | undefined {
  let rows = headers;
  if (typeof headers === "string") {
    try { rows = JSON.parse(headers) as unknown; } catch { return undefined; }
  }
  if (!Array.isArray(rows)) return undefined;
  const wanted = name.toLowerCase();
  for (const row of rows) {
    if (Array.isArray(row) && String(row[0] ?? "").toLowerCase() === wanted) {
      return String(row[1] ?? "").trim() || undefined;
    }
  }
  return undefined;
}

export async function fetchStoredMessage(messageUrl: string): Promise<StoredMailgunMessage> {
  if (!mailgunStorageUrl(messageUrl)) throw new Error("invalid_storage_url");
  const { apiKey } = config();
  const response = await fetch(messageUrl, {
    headers: { Authorization: authorization(apiKey), Accept: "application/json" },
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new Error(String(payload.message ?? `storage_fetch_${response.status}`));
  return {
    from: payload.from ? String(payload.from) : undefined,
    sender: payload.sender ? String(payload.sender) : undefined,
    recipient: payload.recipient ? String(payload.recipient) : undefined,
    subject: payload.subject ? String(payload.subject) : undefined,
    bodyPlain: payload["body-plain"] ? String(payload["body-plain"]) : undefined,
    strippedText: payload["stripped-text"] ? String(payload["stripped-text"]) : undefined,
    bodyHtml: payload["body-html"] ? String(payload["body-html"]) : undefined,
    strippedHtml: payload["stripped-html"] ? String(payload["stripped-html"]) : undefined,
    messageId: headerValue(payload["message-headers"], "Message-Id"),
    inReplyTo: headerValue(payload["message-headers"], "In-Reply-To"),
  };
}

function appUrl(requestUrl?: string): string {
  const configured = env("APP_URL") || env("NEXT_PUBLIC_SITE_URL");
  if (configured) return configured.replace(/\/$/, "");
  return requestUrl ? new URL(requestUrl).origin : "http://localhost:3001";
}

function routeBody(domain: string, hookUrl: string): URLSearchParams {
  const body = new URLSearchParams();
  body.set("priority", "0");
  body.set("description", "Firemode CRM inbox");
  body.set("expression", `match_recipient(".*@${domain}")`);
  body.append("action", `store(notify="${hookUrl}")`);
  return body;
}

export async function ensureMailgunInboundRoute(requestUrl?: string): Promise<{
  hookUrl: string;
  created: boolean;
  updated?: boolean;
  routeId?: string;
}> {
  const { apiKey, domain, baseUrl } = config();
  const hookUrl = `${appUrl(requestUrl)}/api/webhooks/mailgun`;
  if (/localhost|127\.0\.0\.1/i.test(hookUrl)) throw new Error("public_url_required");
  const list = await fetch(`${baseUrl}/v3/routes?limit=100`, {
    headers: { Authorization: authorization(apiKey) },
  });
  const payload = (await list.json().catch(() => ({}))) as {
    items?: Array<{ id?: string; description?: string; actions?: string[] }>;
  };
  if (!list.ok) throw new Error(`route_list_${list.status}`);
  const existing = (payload.items ?? []).find(
    (route) => route.description === "Firemode CRM inbox" ||
      (route.actions ?? []).some((action) => action.includes("/api/webhooks/mailgun")),
  );
  if (existing?.id && (existing.actions ?? []).some((action) => action.includes(hookUrl))) {
    return { hookUrl, created: false, routeId: existing.id };
  }
  if (existing?.id) {
    const response = await fetch(`${baseUrl}/v3/routes/${existing.id}`, {
      method: "PUT",
      headers: { Authorization: authorization(apiKey) },
      body: routeBody(domain, hookUrl),
    });
    if (!response.ok) throw new Error(`route_update_${response.status}`);
    return { hookUrl, created: false, updated: true, routeId: existing.id };
  }
  const response = await fetch(`${baseUrl}/v3/routes`, {
    method: "POST",
    headers: { Authorization: authorization(apiKey) },
    body: routeBody(domain, hookUrl),
  });
  const created = (await response.json().catch(() => ({}))) as { route?: { id?: string }; message?: string };
  if (!response.ok) throw new Error(created.message || `route_create_${response.status}`);
  return { hookUrl, created: true, routeId: created.route?.id };
}
