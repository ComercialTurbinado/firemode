/**
 * Reduz payload de presença/peças para não derrubar a página no Amplify/Chrome.
 * D4U chegou a ~1.1M chars só em `presenca` + ~370k em peças — a aba crashava.
 */

const MAX_LIST = 24;
const MAX_CAPTION = 220;
const MAX_TEXT = 1_200;
const MAX_HIST = 12;

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function truncStr(v: unknown, max = MAX_TEXT): unknown {
  if (typeof v !== "string") return v;
  if (v.length <= max) return v;
  return `${v.slice(0, max)}…`;
}

function slimMidiaItem(item: unknown): unknown {
  if (!isRecord(item)) return item;
  const out: Record<string, unknown> = { ...item };
  out.caption = truncStr(out.caption, MAX_CAPTION);
  out.legenda = truncStr(out.legenda, MAX_CAPTION);
  out.titulo = truncStr(out.titulo, 160);
  // base64 / data-urls estouram o HTML
  for (const k of Object.keys(out)) {
    const val = out[k];
    if (typeof val === "string" && val.startsWith("data:") && val.length > 200) {
      out[k] = null;
    }
  }
  return out;
}

function slimArray(arr: unknown, mapItem?: (x: unknown) => unknown): unknown {
  if (!Array.isArray(arr)) return arr;
  const sliced = arr.slice(0, MAX_LIST);
  return mapItem ? sliced.map(mapItem) : sliced;
}

function slimClienteIg(cliente: unknown): unknown {
  if (!isRecord(cliente)) return cliente;
  return {
    ...cliente,
    posts: slimArray(cliente.posts, slimMidiaItem),
    reels: slimArray(cliente.reels, slimMidiaItem),
  };
}

function slimConcorrenteRede(c: unknown): unknown {
  if (!isRecord(c)) return c;
  const out: Record<string, unknown> = {
    nome: c.nome,
    dominio: c.dominio,
    handle: c.handle,
    fonte_handle: c.fonte_handle,
    match_score: c.match_score,
    perfil: c.perfil,
    periodicidade: c.periodicidade,
    engajamento: c.engajamento,
    erro: c.erro,
    aviso: c.aviso,
  };
  // descarta posts/reels brutos dos rivais (centenas de KB)
  return out;
}

function slimInstagram(ig: unknown): unknown {
  if (!isRecord(ig)) return ig;
  return {
    ...ig,
    cliente: slimClienteIg(ig.cliente),
    concorrentes: slimArray(ig.concorrentes, slimConcorrenteRede),
    grid_midia: slimArray(ig.grid_midia, slimMidiaItem),
    midia_analisada: slimArray(ig.midia_analisada, slimMidiaItem),
  };
}

function slimTiktok(tt: unknown): unknown {
  if (!isRecord(tt)) return tt;
  return {
    ...tt,
    videos: slimArray(tt.videos, slimMidiaItem),
    midia_analisada: slimArray(tt.midia_analisada, slimMidiaItem),
    metricas: isRecord(tt.metricas)
      ? { ...tt.metricas, serie: slimArray((tt.metricas as Record<string, unknown>).serie) }
      : tt.metricas,
    tendencias: slimArray(tt.tendencias),
    concorrentes: slimArray(tt.concorrentes, slimConcorrenteRede),
  };
}

function slimYoutube(yt: unknown): unknown {
  if (!isRecord(yt)) return yt;
  return {
    ...yt,
    videos: slimArray(yt.videos, slimMidiaItem),
    shorts: slimArray(yt.shorts, slimMidiaItem),
    midia_analisada: slimArray(yt.midia_analisada, slimMidiaItem),
    concorrentes: slimArray(yt.concorrentes, slimConcorrenteRede),
  };
}

function slimBlog(blog: unknown): unknown {
  if (!isRecord(blog)) return blog;
  const posts = Array.isArray(blog.posts)
    ? blog.posts.slice(0, 40).map((p) => {
        if (!isRecord(p)) return p;
        return {
          url: p.url,
          titulo: truncStr(p.titulo, 160),
          palavras: p.palavras,
          data: p.data,
          path: p.path,
        };
      })
    : blog.posts;
  return { ...blog, posts };
}

function slimPercepcao(p: unknown): unknown {
  if (!isRecord(p)) return p;
  const evid = Array.isArray(p.evidencias)
    ? p.evidencias.slice(0, 12).map((e) => {
        if (!isRecord(e)) return e;
        return {
          ...e,
          transcricao: truncStr(e.transcricao, 400),
          trecho: truncStr(e.trecho, 400),
        };
      })
    : p.evidencias;
  return { ...p, evidencias: evid };
}

function slimGmb(g: unknown): unknown {
  if (!isRecord(g)) return g;
  return {
    ...g,
    reviews: slimArray(g.reviews, (r) => {
      if (!isRecord(r)) return r;
      return { ...r, texto: truncStr(r.texto, 280) };
    }),
  };
}

/** Presença enxuta para SSR → client (painéis do admin). */
export function slimPresencaForUi(presenca: unknown): Record<string, unknown> {
  if (!isRecord(presenca)) return {};
  const urls = Array.isArray(presenca.urls_internas) ? presenca.urls_internas : null;
  const out: Record<string, unknown> = { ...presenca };

  // só precisam de contagem na UI do admin
  delete out.urls_internas;
  if (urls) out._urls_internas_count = urls.length;

  // midia_comparativo: mantém estrutura, corta listas pesadas
  if (isRecord(out.midia_comparativo)) {
    const mc = { ...out.midia_comparativo };
    for (const k of Object.keys(mc)) {
      if (Array.isArray(mc[k])) mc[k] = slimArray(mc[k], slimMidiaItem);
    }
    out.midia_comparativo = mc;
  }

  out.instagram = slimInstagram(out.instagram);
  out.tiktok = slimTiktok(out.tiktok);
  out.youtube = slimYoutube(out.youtube);
  out.blog = slimBlog(out.blog);
  out.percepcao_valor = slimPercepcao(out.percepcao_valor);
  out.google_meu_negocio = slimGmb(out.google_meu_negocio);
  out.scorecard_historico = Array.isArray(out.scorecard_historico)
    ? out.scorecard_historico.slice(-MAX_HIST)
    : out.scorecard_historico;

  return out;
}

/** Flags mínimos para AutoPresencaFill (sem mandar megabytes pro client). */
export function slimPresencaFlags(presenca: Record<string, unknown> | null | undefined): Record<string, unknown> {
  const p = presenca ?? {};
  const keys = [
    "tech_seo",
    "google_meu_negocio",
    "autoridade_busca",
    "meta_ads",
    "youtube",
    "instagram",
    "tiktok",
    "ai_visibility",
    "posicionamento",
    "audiencia_ideal",
    "percepcao_valor",
    "plano_impacto",
    "pipeline",
  ] as const;
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    const b = p[k];
    if (!isRecord(b)) {
      out[k] = b ?? null;
      continue;
    }
    out[k] = {
      erro: b.erro ?? null,
      atualizado_em: b.atualizado_em ?? null,
      gerado_em: b.gerado_em ?? null,
      nota_interna: isRecord(b.nota_interna) ? { nota: b.nota_interna.nota } : null,
      status: b.status ?? null,
    };
  }
  return out;
}

const ARTIGO_TEXT_KEYS = [
  "corpo",
  "conteudo",
  "html",
  "markdown",
  "texto",
  "artigo",
  "body",
  "conteudo_html",
  "conteudo_md",
];

/** Peças: artigos completos estouram o HTML — deixa excerpt + marca para fetch sob demanda. */
export function slimPecaForUi<T extends { tipo?: string; id?: string; payload?: Record<string, unknown> | null }>(
  peca: T,
): T {
  if (peca.tipo !== "artigo" || !peca.payload) return peca;
  const payload: Record<string, unknown> = { ...peca.payload };
  let truncated = false;
  for (const k of ARTIGO_TEXT_KEYS) {
    const v = payload[k];
    if (typeof v === "string" && v.length > MAX_TEXT) {
      payload[k] = `${v.slice(0, MAX_TEXT)}\n\n…`;
      truncated = true;
    }
  }
  // Artigos Firemode usam `blocos` (dezenas de KB) — lista só com meta
  if (Array.isArray(payload.blocos)) {
    payload._blocos_total = payload.blocos.length;
    payload.blocos = [];
    truncated = true;
  }
  if (truncated) {
    payload._texto_completo_disponivel = true;
    payload._peca_id = peca.id;
  }
  return { ...peca, payload };
}
