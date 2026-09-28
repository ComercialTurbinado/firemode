/**
 * Converte valores mistos (string | object | array) em texto seguro p/ React.
 * Evita "Objects are not valid as a React child" em campos LLM/JSON.
 */

const TOM_KEYS = [
  "personalidade",
  "como_falar",
  "como_nao_falar",
  "exemplos_frase_ok",
  "exemplos_frase_evitar",
  "tom",
  "exemplo_mensagem",
  "vocabulario",
  "evitar_dizer",
] as const;

function joinList(v: unknown): string | null {
  if (!Array.isArray(v) || !v.length) return null;
  const parts = v
    .map((x) => (typeof x === "string" ? x.trim() : asDisplayText(x, 120)))
    .filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/** Texto curto pra UI; nunca retorna object. */
export function asDisplayText(value: unknown, max = 800): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value.trim().slice(0, max);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return (joinList(value) || "").slice(0, max);

  if (typeof value === "object") {
    const o = value as Record<string, unknown>;

    // Tom de voz / como_falar estruturado
    const hasTomShape = TOM_KEYS.some((k) => o[k] != null);
    if (hasTomShape) {
      const lines: string[] = [];
      const personalidade = asDisplayText(o.personalidade || o.tom, 300);
      if (personalidade) lines.push(personalidade);
      const como = asDisplayText(o.como_falar, 240);
      if (como) lines.push(`Como falar: ${como}`);
      const nao = asDisplayText(o.como_nao_falar || o.evitar_dizer, 240);
      if (nao) lines.push(`Evitar: ${nao}`);
      const ok = joinList(o.exemplos_frase_ok) || asDisplayText(o.exemplo_mensagem, 240);
      if (ok) lines.push(`Exemplos: ${ok}`);
      const evitar = joinList(o.exemplos_frase_evitar);
      if (evitar) lines.push(`Não dizer: ${evitar}`);
      const vocab = joinList(o.vocabulario);
      if (vocab) lines.push(`Vocabulário: ${vocab}`);
      if (lines.length) return lines.join("\n").slice(0, max);
    }

    // Fallbacks comuns
    for (const k of ["texto", "resumo", "sintese", "titulo", "label", "nome", "descricao"]) {
      const t = asDisplayText(o[k], max);
      if (t) return t;
    }

    try {
      return JSON.stringify(value).slice(0, max);
    } catch {
      return "";
    }
  }

  return String(value).slice(0, max);
}

export function hasDisplayText(value: unknown): boolean {
  return Boolean(asDisplayText(value));
}
