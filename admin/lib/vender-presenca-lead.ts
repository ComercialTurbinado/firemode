/**
 * Triagem comercial do lead da LP /vender/presenca.
 *
 * PATH:presenca_completa → tem site → Content Machine POST /analisar {url}
 *   (+ IG se informado vira cliente_handle / redes)
 *
 * PATH:instagram_radar → sem site, tem @ → Radar Espião / auditoria IG
 *   (+ recomendação comercial: criar site; presença completa depois)
 *
 * PATH:contato → só WhatsApp/e-mail (formulário exige site ou IG)
 */

export type PresencaLeadPath = "presenca_completa" | "instagram_radar";

export type PresencaLeadFields = {
  nome?: string;
  site?: string;
  instagram?: string;
  whatsapp?: string;
  email?: string;
  abVariant?: string | null;
};

export function normalizeInstagramHandle(raw: string): string | null {
  const t = raw.trim().replace(/^@+/, "").replace(/\/+$/, "");
  if (!t) return null;
  // URL do Instagram → handle
  const fromUrl = t.match(
    /(?:instagram\.com\/)(?:explore\/tags\/)?([A-Za-z0-9._]+)/i,
  );
  const handle = (fromUrl?.[1] ?? t).replace(/[^A-Za-z0-9._]/g, "");
  if (handle.length < 2) return null;
  return handle.toLowerCase();
}

export function normalizeSiteUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  // Se parece handle IG, não trate como site
  if (t.startsWith("@") || /^instagram\.com\//i.test(t.replace(/^https?:\/\//i, ""))) {
    return null;
  }
  const url = t.match(/^https?:\/\//i) ? t : `https://${t}`;
  try {
    const u = new URL(url);
    if (!u.hostname.includes(".")) return null;
    return u.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

/** Detecta se o valor único do hero é site ou Instagram. */
export function parsePresenceOrInstagram(raw: string): {
  site: string | null;
  instagram: string | null;
} {
  const t = raw.trim();
  if (!t) return { site: null, instagram: null };
  if (
    t.startsWith("@") ||
    /instagram\.com/i.test(t) ||
    (!t.includes(".") && /^[A-Za-z0-9._]+$/.test(t))
  ) {
    return { site: null, instagram: normalizeInstagramHandle(t) };
  }
  return { site: normalizeSiteUrl(t), instagram: null };
}

export function resolvePresencaLeadPath(
  site: string | null | undefined,
  instagram: string | null | undefined,
): PresencaLeadPath | null {
  if (site) return "presenca_completa";
  if (instagram) return "instagram_radar";
  return null;
}

export function pathLabel(path: PresencaLeadPath): string {
  return path === "presenca_completa"
    ? "Olhar tudo (site + canais)"
    : "Olhar Instagram (+ falar sobre site)";
}

export function buildPresencaLeadWhatsappMsg(fields: PresencaLeadFields): string | null {
  const site = fields.site ? normalizeSiteUrl(fields.site) : null;
  const ig = fields.instagram ? normalizeInstagramHandle(fields.instagram) : null;
  const path = resolvePresencaLeadPath(site, ig);
  if (!path) return null;

  const lines = [
    "Olá. Quero o diagnóstico Firemode.",
    `Nome: ${fields.nome?.trim() || "—"}`,
    `Site: ${site || "— (sem site)"}`,
    `Instagram: ${ig ? `@${ig}` : "—"}`,
    `WhatsApp: ${fields.whatsapp?.trim() || "—"}`,
    `E-mail: ${fields.email?.trim() || "—"}`,
    "",
    `[PATH:${path}]`,
    `Triagem: ${pathLabel(path)}`,
  ];
  if (path === "instagram_radar") {
    lines.push("Obs.: sem site — olhar IG/concorrentes e falar sobre criar site.");
  }
  if (fields.abVariant) {
    lines.push(`[AB:${fields.abVariant}]`);
  }
  return lines.join("\n");
}
