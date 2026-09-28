import { getEnvVar } from "@/lib/ssm-env";

export type JobStep = {
  key: string;
  label: string;
  descricao?: string;
  status: "pending" | "running" | "done" | "error" | string;
  detail?: string | null;
  secs?: number | null;
  modelo?: string | null;
};

export type JobStatus = {
  id: string;
  status: string;
  error?: string | null;
  current?: string | null;
  steps: JobStep[];
  pauta_id?: string | null;
  cliente_handle?: string | null;
};

export async function dispararConteudo(opts: {
  cliente_handle: string;
  pauta_id: string;
}): Promise<{ job_id: string }> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/conteudo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cliente_handle: opts.cliente_handle,
      pauta_id: opts.pauta_id,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Content Machine respondeu ${res.status}`);
  }

  return res.json();
}

export async function atualizarGmb(
  analise_web_id: string,
  place_id?: string | null,
  opts?: { refazer_busca?: boolean },
): Promise<{
  ok: boolean;
  google_meu_negocio?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  let res: Response;
  try {
    res = await fetch(`${base}/gmb/atualizar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analise_web_id,
        place_id: place_id || undefined,
        refazer_busca: Boolean(opts?.refazer_busca),
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "fetch failed";
    return {
      ok: false,
      error: `Content Machine indisponível (${base}). ${msg.includes("ECONNREFUSED") || msg.includes("fetch failed") ? "Suba o servidor na porta 8000." : msg}`,
    };
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, google_meu_negocio: data.google_meu_negocio };
}

export async function atualizarTechSeo(analise_web_id: string): Promise<{
  ok: boolean;
  tech_seo?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/tech-seo/atualizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, tech_seo: data.tech_seo };
}

export async function gerarLlmsTxt(analise_web_id: string): Promise<{
  ok: boolean;
  conteudo?: string;
  bytes?: number;
  url_destino?: string;
  nome_arquivo?: string;
  gerado_em?: string;
  aviso?: string;
  ja_publicado?: boolean;
  tech_seo?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/tech-seo/llms-txt/gerar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return {
    ok: true,
    conteudo: data.conteudo,
    bytes: data.bytes,
    url_destino: data.url_destino,
    nome_arquivo: data.nome_arquivo,
    gerado_em: data.gerado_em,
    aviso: data.aviso,
    ja_publicado: data.ja_publicado,
    tech_seo: data.tech_seo,
  };
}

export async function atualizarAiVisibility(
  analise_web_id: string,
  prompts?: string[],
): Promise<{
  ok: boolean;
  ai_visibility?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/ai-visibility/atualizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id, prompts }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, ai_visibility: data.ai_visibility };
}

export async function sincronizarConcorrentes(analise_web_id: string): Promise<{
  ok: boolean;
  adicionados?: number;
  mesclados?: number;
  sugeridos?: Record<string, unknown>[];
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/concorrentes/sincronizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return {
    ok: true,
    adicionados: data.adicionados,
    mesclados: data.mesclados,
    sugeridos: data.sugeridos,
  };
}

export async function atualizarPosicionamento(analise_web_id: string): Promise<{
  ok: boolean;
  posicionamento?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/posicionamento/atualizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, posicionamento: data.posicionamento };
}

export async function atualizarAudienciaIdeal(analise_web_id: string): Promise<{
  ok: boolean;
  audiencia_ideal?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/audiencia/atualizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, audiencia_ideal: data.audiencia_ideal };
}

export async function atualizarAutoridadeBusca(analise_web_id: string): Promise<{
  ok: boolean;
  autoridade_busca?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/autoridade-busca/atualizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, autoridade_busca: data.autoridade_busca };
}

export async function atualizarMetaAds(analise_web_id: string): Promise<{
  ok: boolean;
  meta_ads?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/meta-ads/atualizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, meta_ads: data.meta_ads };
}

export async function atualizarYoutube(analise_web_id: string): Promise<{
  ok: boolean;
  youtube?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/youtube/atualizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, youtube: data.youtube };
}

export async function atualizarInstagram(analise_web_id: string): Promise<{
  ok: boolean;
  instagram?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/instagram/atualizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, instagram: data.instagram };
}

export async function atualizarTiktok(analise_web_id: string): Promise<{
  ok: boolean;
  tiktok?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/tiktok/atualizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, tiktok: data.tiktok };
}

export async function atualizarBlog(analise_web_id: string): Promise<{
  ok: boolean;
  blog?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/blog/atualizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, blog: data.blog };
}

export async function auditarQualidadeBlog(analise_web_id: string): Promise<{
  ok: boolean;
  blog?: Record<string, unknown>;
  qualidade?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/blog/qualidade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, blog: data.blog, qualidade: data.qualidade };
}

export async function gerarPlanoImpacto(analise_web_id: string): Promise<{
  ok: boolean;
  plano_impacto?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/impacto/gerar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, plano_impacto: data.plano_impacto };
}

export async function atualizarPercepcaoValor(analise_web_id: string): Promise<{
  ok: boolean;
  percepcao_valor?: Record<string, unknown>;
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/percepcao-valor/atualizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_web_id }),
    signal: AbortSignal.timeout(280_000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, percepcao_valor: data.percepcao_valor };
}

export async function desiaizarPeca(peca_id: string): Promise<{
  ok: boolean;
  payload?: Record<string, unknown>;
  muletas_antes?: string[];
  muletas_depois?: string[];
  error?: string;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/desiaizar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ peca_id }),
    signal: AbortSignal.timeout(120_000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return {
    ok: true,
    payload: data.payload,
    muletas_antes: data.muletas_antes,
    muletas_depois: data.muletas_depois,
  };
}

export async function statusJobConteudo(jobId: string): Promise<JobStatus> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/job/${jobId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Job não encontrado (${res.status})`);
  }
  const data = await res.json();
  return {
    id: data.id,
    status: data.status,
    error: data.error ?? null,
    current: data.current ?? null,
    steps: data.steps ?? [],
    pauta_id: data.pauta_id ?? null,
    cliente_handle: data.cliente_handle ?? null,
  };
}

export async function analisarVideo(
  analise_web_id: string,
  video_id: string,
  extra?: {
    url?: string | null;
    legenda?: string | null;
    titulo?: string | null;
    rede?: string | null;
    views?: number | null;
    likes?: number | null;
    transcricao?: string | null;
  },
): Promise<{
  ok?: boolean; analise?: unknown; cacheado?: boolean; error?: string; erro?: string;
  transcrito_agora?: boolean;
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/analisar-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analise_web_id,
        video_id,
        url: extra?.url || undefined,
        legenda: extra?.legenda || undefined,
        titulo: extra?.titulo || undefined,
        rede: extra?.rede || undefined,
        views: extra?.views ?? undefined,
        likes: extra?.likes ?? undefined,
        transcricao: extra?.transcricao || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { erro: data.detail || data.error || "Falha ao analisar vídeo" };
    return data;
  } catch (e) {
    return { erro: String(e) };
  }
}

/** Orquestra sequência full (site novo) ou refresh (TTL) de presença. */
export async function iniciarPresencaPipeline(opts: {
  analise_web_id?: string;
  url?: string;
  cliente_handle?: string;
  modo?: "full" | "refresh" | null;
  force?: boolean;
}): Promise<{ ok: boolean; job_id?: string; modo?: string; error?: string }> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/presenca/pipeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      analise_web_id: opts.analise_web_id || undefined,
      url: opts.url || undefined,
      cliente_handle: opts.cliente_handle || undefined,
      modo: opts.modo || undefined,
      force: Boolean(opts.force),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.error || data.erro || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }
  return { ok: true, job_id: data.job_id, modo: data.modo };
}

export async function statusPresencaPipeline(jobId: string): Promise<JobStatus & {
  modo?: string;
  analise_web_id?: string | null;
  result?: { analise_web_id?: string };
}> {
  const base = ((await getEnvVar("CONTENT_MACHINE_URL")) || "http://localhost:8000").replace(/\/$/, "");
  const res = await fetch(`${base}/presenca/pipeline/${jobId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Pipeline não encontrado (${res.status})`);
  }
  const data = await res.json();
  return {
    id: data.id,
    status: data.status,
    error: data.error ?? null,
    current: data.current ?? null,
    steps: data.steps ?? [],
    modo: data.modo,
    analise_web_id: data.analise_web_id ?? data.result?.analise_web_id ?? null,
    result: data.result,
  };
}
