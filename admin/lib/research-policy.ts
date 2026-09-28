/** Limites comerciais do diagnóstico para manter profundidade e custo previsíveis. */
export const RESEARCH_POLICY = {
  provider: "brightdata",
  maxMappedCompetitors: 20,
  maxDeepCompetitors: 3,
  maxPostsPerCompetitor: 20,
  maxCommentsPerCompetitor: 20,
  competitorCacheDays: 7,
  maxEstimatedCostUsdPerReport: 1.5,
} as const;

