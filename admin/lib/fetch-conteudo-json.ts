/** Fetch JSON das rotas /api/conteudo/* com erro legível (evita falhar em HTML/login). */

export async function fetchConteudoJson<T = Record<string, unknown>>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    credentials: "same-origin",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const text = await res.text();
  let data: Record<string, unknown> = {};
  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      const snippet = text.replace(/\s+/g, " ").trim().slice(0, 120);
      throw new Error(
        res.status === 401 || /login/i.test(text)
          ? "Sessão expirada — recarregue e faça login de novo."
          : `Resposta inválida da API (${res.status}): ${snippet || "vazia"}`,
      );
    }
  }

  if (!res.ok) {
    const err =
      (typeof data.error === "string" && data.error) ||
      (typeof data.erro === "string" && data.erro) ||
      (typeof data.detail === "string" && data.detail) ||
      `HTTP ${res.status}`;
    throw new Error(err);
  }

  return data as T;
}
