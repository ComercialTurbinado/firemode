# Visibilidade em IA (LLM Search) — desenho Firemode

Referências analisadas: **Ainalytics** + **Goodie** (AI visibility / GEO).  
Objetivo: agregar o canal **“o que a IA responde”** sem virar só um monitor SaaS — encaixar no Diagnóstico + mapa de ação.

---

## 1. O que a Goodie reforça (além da Ainalytics)

| Ideia Goodie | Como usar na Firemode |
|---|---|
| “Mostre sua marca no ChatGPT / Perplexity / Gemini / Google AI Overviews” | Canal novo no scorecard: **IA / LLM** |
| Query box → resposta simulada com citação | Demo + auditoria: **prompt → quem foi citado** |
| Ranking “onde você aparece” vs concorrentes | **Share of answer** por prompt |
| Sentiment / brand perception na IA | Ligar depois à **percepção de valor** (já existe) |
| Optimize for AI search engines | Checklist técnico + plano de impacto |
| Enterprise / API | Fase 3 — não priorizar agora |

**Diferença Firemode:** eles vendem monitor contínuo; nós vendemos **diagnóstico + correção + conteúdo**. O score de IA vira mais um olhar do mapa, não o produto inteiro.

---

## 2. Arquitetura em 2 camadas

### Camada A — Preparação técnica (barata, imediata)
Estende `presenca.tech_seo` (Content Machine `POST /tech-seo/atualizar`).

### Camada B — Resultados de busca LLM (o “LLM search results”)
Novo bloco `presenca.ai_visibility` (CM `POST /ai-visibility/atualizar`).

Scorecard: canal **IA** (ou “LLM”) usando `nota_interna` desse bloco.

---

## 3. Checklist técnico (Camada A)

Itens a gerar no CM e renderizar no `TechSeoPanel` (grid + `checklist[]`).

| id | Label | Como verificar | Peso sugerido |
|---|---|---|---|
| `llms_txt` | `llms.txt` presente | `GET {origin}/llms.txt` → 200 + texto útil | alto |
| `llms_txt_quality` | `llms.txt` útil | Tem nome, oferta, URLs canônicas, contato; não é lorem | médio |
| `robots_txt` | `robots.txt` encontrado | Já parcial hoje — garantir item explícito | alto |
| `ai_bots_allowed` | Crawlers de IA permitidos | Parse robots: **não** `Disallow` em GPTBot, ClaudeBot, Google-Extended, PerplexityBot, Bytespider (ou documentar bloqueio) | alto |
| `sitemap_ok` | Sitemap acessível | Já existe `sitemap` | alto |
| `https_ok` | HTTPS | Já existe | alto |
| `schema_org` | Schema presente | Já existe | médio |
| `faq_schema` | FAQ / HowTo schema | Tipos no JSON-LD | médio (ajuda overviews/IA) |
| `canonical_ok` | Canonical coerente | Já em meta | médio |
| `content_indexable` | Páginas de oferta indexáveis | Meta robots ≠ `noindex` nas URLs-chave | alto |
| `entity_clarity` | Entidade clara na home | Nome + o que faz + cidade/nicho em H1/about (heurística) | médio |

### Bloco tipado opcional em `tech_seo`

```ts
ai_prep?: {
  llms_txt?: { ok: boolean; url?: string | null; bytes?: number; detalhe?: string };
  bots?: {
    gptbot?: "allow" | "block" | "unknown";
    claudebots?: "allow" | "block" | "unknown";
    google_extended?: "allow" | "block" | "unknown";
    perplexitybot?: "allow" | "block" | "unknown";
  };
  score?: { ok: number; total: number };
};
```

Glossário: adicionar `llms.txt` e “crawlers de IA” em `lib/glossario-presenca.ts`.

---

## 4. LLM Search Results (Camada B) — o que precisamos

### 4.1 Dados no Supabase / JSON `presenca.ai_visibility`

```ts
type AiVisibilityData = {
  atualizado_em?: string;
  erro?: string | null;

  /** Score 0–100: probabilidade de ser citado/recomendado */
  nota_interna?: {
    nota?: number;
    faixa?: string; // ruim | regular | bom | excelente
    breakdown?: {
      semantica?: number;
      profundidade?: number;
      autoridade?: number;
      acesso_tecnico?: number;
      posicao_competitiva?: number;
    };
  };

  /** O que a IA “entende” da marca (síntese) */
  entidade?: {
    resumo?: string;
    publico?: string;
    temas?: string[];
  };

  /** Prompts monitorados (máx. 5 no diagnóstico; 3 no free/trial) */
  prompts?: AiPromptResult[];

  /** Concorrentes que roubam resposta */
  concorrentes_citados?: { nome: string; dominio?: string; aparicoes: number }[];

  checklist?: { id: string; ok: boolean; label: string; detalhe: string; peso?: string }[];
  melhorias_rapidas?: {
    titulo: string;
    porque?: string;
    como?: string;
    esforco?: string;
    impacto?: string;
  }[];
  resumo?: string;
  especialista?: unknown;
};

type AiPromptResult = {
  id: string;
  prompt: string;           // "melhor visto americano pra quem tem diploma…"
  tema?: string;            // agrupador
  engines?: {
    engine: "chatgpt" | "gemini" | "perplexity" | "claude" | "ai_overview";
    citado: boolean;
    posicao?: number | null;  // 1 = citado primeiro / recomendado
    trecho?: string | null;   // snippet da resposta
    concorrentes?: string[];
    coletado_em?: string;
  }[];
  share_of_answer?: number; // 0–100 nesta pergunta
};
```

### 4.2 Fontes de coleta (o que “precisamos ter”)

| Engine | Como obter resultado | Custo / risco | Fase |
|---|---|---|---|
| **ChatGPT** | API Responses / browsing **ou** provedor tipo Bright Data / serper-like “LLM answers” | Médio–alto; ToS | 1 (1 engine) |
| **Perplexity** | API oficial ou scrape controlado | Médio | 1–2 |
| **Gemini** | Grounding API / AI Studio | Médio | 2 |
| **Claude** | API (sem browse estável) → citar só se houver tool web | Alto | 2–3 |
| **Google AI Overviews** | SERP API com AIO (DataForSEO, SerpAPI, ValueSERP) | Médio; já próximo da autoridade_busca | 1 (recomendado) |

**MVP recomendado Firemode**
1. AI Overviews (encaixa no stack SERP que já usam).  
2. 1 LLM com API (ChatGPT **ou** Perplexity).  
3. 3–5 prompts por análise (nicho derivados do diagnóstico + input do cliente).  
4. Score + “quem foi citado” + 3 melhorias.

**Não fazer no MVP:** sentiment dashboard tipo Goodie, API pública, monitor 24/7 multi-tenant.

### 4.3 Fluxo operacional

```
Cliente manda site/IG
  → CM gera temas candidatos (do diagnostico.nicho / oferta)
  → Admin ou LP seleciona até 5 prompts (opcional; senão auto)
  → POST /ai-visibility/atualizar { analise_web_id, prompts? }
  → Coleta engines → grava presenca.ai_visibility
  → Scorecard canal IA + painel AiVisibilityPanel
  → Melhorias entram no Plano de Impacto (fonte: ai_visibility)
```

### 4.4 Checklist de “resultado LLM” (produto)

Além do técnico:

| id | Significado |
|---|---|
| `prompt_coverage` | Há ≥3 prompts da categoria rodados |
| `cited_once` | Marca citada em ≥1 engine/prompt |
| `share_ok` | Share médio ≥ concorrente #1 ou threshold |
| `entity_match` | Resumo da IA bate com oferta real |
| `external_proof` | Reviews/menções externas detectáveis (fase 2) |
| `content_depth` | Páginas/FAQ suficientes pro tema (liga ao blog) |

### 4.5 Env / infra necessários

```
# CM
OPENAI_API_KEY=...                 # ou PERPLEXITY_API_KEY
SERPAPI_KEY=... / DATAFORSEO_...   # AI Overviews
AI_VISIBILITY_ENGINES=aio,perplexity
AI_VISIBILITY_MAX_PROMPTS=5
```

Tabela opcional (histórico semanal — fase 2):

`lp` / `ai_visibility_snapshots`  
`(analise_web_id, engine, prompt_hash, citado, posicao, raw_ref, collected_at)`

---

## 5. UI admin (espelho do padrão atual)

1. **TechSeoPanel** — células `llms.txt` + bots; checklist novos ids.  
2. **AiVisibilityPanel** (novo, `#ia`) — nota, breakdown 5 eixos, lista de prompts com chips por engine, concorrentes, CTA Atualizar.  
3. **ScorecardPresenca** — canal `ia`.  
4. **ApresentacaoLP / mock** — card “IA recomenda?”.  
5. **LP comercial** — uma linha no método (depois de ter V1).

---

## 6. Fases de entrega

| Fase | Entrega | Esforço |
|---|---|---|
| **A0** | Checklist `llms.txt` + bots no tech-seo (CM + admin + glossário) | **Feito** |
| **B1** | `ai_visibility` MVP: tech score + estimativa LLM, painel, scorecard, LP `#ia` | **Feito** (coleta multi-engine real = B2/B3) |
| **B2** | Seleção de prompts na UI (estilo Ainalytics), histórico semanal | Médio |
| **B3** | Multi-engine + share of answer + plays no impacto | Maior |

---

## 7. Critério de sucesso

- Diagnóstico mostra: **nota IA + 3 prompts + quem a IA citou no lugar do cliente**.  
- Checklist técnico marca vermelho se não tem `llms.txt` ou bloqueia GPTBot.  
- Plano de impacto ganha 1–2 ações “para a IA te recomendar” (FAQ, prova externa, página de intenção).

---

## 8. O que NÃO copiar

- Pricing page só de monitor (Starter/Growth).  
- Promessa “apareça no ChatGPT” sem execução.  
- Sentiment vanity charts antes de ter citação real.
