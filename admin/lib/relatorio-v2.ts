import type { PlanoImpactoData, MovimentoImpacto } from "@/app/fireadmin/(app)/conteudo/[id]/ImpactoPanel";
import type { ReputacaoLP } from "@/lib/apresentacao-reputacao";
import type { AcaoCanal, Achado, CanalInsight } from "@/lib/apresentacao-presenca";
import type { CanalScore } from "@/lib/presenca-scorecard";
import { RESEARCH_POLICY } from "@/lib/research-policy";

export type RelatorioV2Confidence = "alta" | "media" | "baixa";

export type RelatorioV2Stage = {
  id: "descoberta" | "confianca" | "conversao" | "distribuicao";
  label: string;
  score: number | null;
  summary: string;
  channels: string[];
};

export type RelatorioV2Movement = {
  order: number;
  title: string;
  channel: string;
  gap: string;
  evidence: string;
  consequence: string;
  action: string;
  kpi: string;
  effort: "baixo" | "medio" | "alto";
  impact: "baixo" | "medio" | "alto";
  confidence: RelatorioV2Confidence;
  validationNote: string | null;
};

export type RelatorioV2Competitor = {
  name: string;
  domain: string | null;
  appearances: number;
  status: "confirmado" | "validar";
};

export type RelatorioV2Content = {
  title: string;
  platform: string;
  funnelStage: string;
  status: string;
  angle: string | null;
};

export type RelatorioV2Issue = {
  category: string;
  title: string;
  evidence: string | null;
  severity: "critico" | "atencao" | "oportunidade";
  origin: string;
};

export type RelatorioV2Action = {
  category: string;
  title: string;
  how: string | null;
  why: string | null;
  technicalAction: string;
  editorialAction: string;
  owner: string;
  doneWhen: string;
  effort: "baixo" | "medio" | "alto";
  impact: "baixo" | "medio" | "alto";
  timeline: "7 dias" | "15 dias" | "30 dias";
  expectedResult: string;
};

export type RelatorioV2DiagnosticItem = {
  category: string;
  problem: RelatorioV2Issue;
  solution: RelatorioV2Action | null;
};

export type RelatorioV2ChannelDiagnostic = {
  id: string;
  label: string;
  score: number | null;
  sourceScore: number | null;
  scoreRationale: string | null;
  status: "auditado" | "parcial" | "validar";
  summary: string | null;
  priority: string | null;
  strengths: string[];
  issues: RelatorioV2Issue[];
  actions: RelatorioV2Action[];
  diagnosticItems: RelatorioV2DiagnosticItem[];
  expectedOutcome: string;
  validationNote: string | null;
};

export type RelatorioV2RoadmapPhase = {
  id: "7" | "15" | "30";
  label: string;
  objective: string;
  actions: Array<RelatorioV2Action & { channel: string }>;
};

export type RelatorioV2Data = {
  id: string;
  company: string;
  url: string;
  niche: string | null;
  generatedAt: string;
  thesis: string;
  executiveSummary: string;
  decision: string;
  overallScore: number | null;
  channels: CanalScore[];
  stages: RelatorioV2Stage[];
  strengths: CanalScore[];
  movements: RelatorioV2Movement[];
  competitors: RelatorioV2Competitor[];
  competitorScope: {
    mapped: number;
    analyzed: number;
    postLimit: number;
    commentsLimit: number;
  };
  reputation: {
    rating: number | null;
    reviewCount: number | null;
    sentimentIndex: number | null;
    sentimentSample: number | null;
    positiveThemes: string[];
    negativeThemes: string[];
    reclameAquiStatus: "validado" | "parcial" | "nao_validado" | "nao_encontrado";
  } | null;
  content: RelatorioV2Content[];
  doNotDoNow: string[];
  qualityNotes: string[];
  diagnosticScope: {
    auditedChannels: number;
    totalProblems: number;
    criticalProblems: number;
    totalActions: number;
    highImpactActions: number;
  };
  channelDiagnostics: RelatorioV2ChannelDiagnostic[];
  roadmap: RelatorioV2RoadmapPhase[];
};

type CompetitorInput = {
  nome?: string | null;
  dominio?: string | null;
  tipo?: string | null;
  aparicoes?: number | null;
  status?: string | null;
};

type ContentInput = {
  titulo?: string | null;
  plataforma?: string | null;
  etapa_funil?: string | null;
  status?: string | null;
  angulo?: string | null;
};

type BuildRelatorioV2Input = {
  id: string;
  company: string;
  url: string;
  niche?: string | null;
  generatedAt?: string | null;
  scoreOverall: number | null;
  channels: CanalScore[];
  plan: PlanoImpactoData | null;
  reputation: ReputacaoLP | null;
  reputationCollectionError?: boolean;
  metaAdsActive?: boolean;
  competitors?: CompetitorInput[] | null;
  content?: ContentInput[] | null;
  qualityNotes?: string[];
  channelInsights?: CanalInsight[];
};

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.replace(/\s+/g, " ").trim();
  if (/\[object Object\]/i.test(clean)) return null;
  if (/^\{\s*"[a-z0-9_]+"\s*:/i.test(clean)) return null;
  return clean || null;
}

function roundedAverage(values: (number | null | undefined)[]) {
  const valid = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!valid.length) return null;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function normalizeLevel(value: unknown): "baixo" | "medio" | "alto" {
  const normalized = String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/alto|crit|grande/.test(normalized)) return "alto";
  if (/baixo|pequeno/.test(normalized)) return "baixo";
  return "medio";
}

function issueSeverity(issue: Achado, score: number | null): RelatorioV2Issue["severity"] {
  const impact = normalizeLevel(issue.impacto);
  if (impact === "alto" || (score != null && score < 50)) return "critico";
  if (impact === "baixo" || issue.origem === "oportunidade") return "oportunidade";
  return "atencao";
}

function actionTimeline(action: AcaoCanal): RelatorioV2Action["timeline"] {
  const declared = String(action.prazo || "").toLowerCase();
  if (/\b7\b|semana|agora|imediat|urgent/.test(declared)) return "7 dias";
  if (/\b30\b|m[eê]s|estrutural/.test(declared)) return "30 dias";
  if (/\b15\b|quinzen|2\s*sem/.test(declared)) return "15 dias";
  const effort = normalizeLevel(action.esforco);
  const impact = normalizeLevel(action.impacto);
  if (effort === "baixo" && impact === "alto") return "7 dias";
  if (effort === "alto") return "30 dias";
  return "15 dias";
}

function expectedResultForChannel(id: string) {
  const outcomes: Record<string, string> = {
    site: "Reduzir fricção, sustentar a promessa e aumentar a proporção de visitantes que avançam para contato.",
    busca: "Aumentar o controle da primeira página da busca de marca e reduzir o espaço ocupado por terceiros na decisão.",
    ia: "Elevar a probabilidade de a marca ser compreendida, citada e recomendada em respostas de IA relevantes ao nicho.",
    gmb: "Fortalecer prova local e reputação para reduzir risco percebido antes do contato comercial.",
    blog: "Construir autoridade temática e demanda orgânica recorrente, conectada às páginas que geram oportunidade.",
    ads: "Validar aquisição previsível com oferta, público, geografia e custo por lead qualificado mensuráveis.",
    instagram: "Transformar alcance e frequência em compreensão da oferta, conversas qualificadas e demanda assistida.",
    tiktok: "Converter atenção de descoberta em reconhecimento de marca e tráfego qualificado para os próximos passos.",
    youtube: "Aproveitar autoridade e profundidade para aumentar confiança, busca de marca e intenção comercial.",
    percepcao: "Alinhar o que a empresa entrega ao que o mercado entende, elevando diferenciação e valor percebido.",
    radar: "Transformar sinais competitivos em decisões editoriais mais rápidas e menos dependentes de opinião.",
  };
  return outcomes[id] || "Reduzir o gargalo identificado e criar uma evolução mensurável entre presença, confiança e oportunidade comercial.";
}

function expectedResultForAction(action: AcaoCanal, channelId: string) {
  const subject = `${action.titulo} ${action.como || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/pagespeed|mobile|veloc|core web|performance|convers|cta|landing/.test(subject)) {
    return "Reduzir fricção na experiência e aumentar a chance de o visitante avançar para o próximo passo.";
  }
  if (/serp|knowledge graph|sitelink|busca de marca|seo local/.test(subject)) {
    return "Ampliar o controle da busca de marca, a autoridade percebida e a entrada de tráfego qualificado.";
  }
  if (/llms|crawler|schema|chatgpt|gemini|perplexity|inteligencia artificial|\bia\b/.test(subject)) {
    return "Tornar a oferta mais legível para mecanismos de IA e elevar a probabilidade de citação em perguntas relevantes.";
  }
  if (/review|avaliac|reclame|gmb|google meu negocio|maps|reput/.test(subject)) {
    return "Reforçar prova pública e reduzir risco percebido antes do contato com o comercial.";
  }
  if (/campanha|anuncio|ads|midia paga|lead|segmenta|remarketing/.test(subject)) {
    return "Gerar aprendizado mensurável sobre oferta, público e custo de aquisição antes de escalar investimento.";
  }
  if (/blog|artigo|keyword|palavra-chave|linkagem|conteudo editorial/.test(subject)) {
    return "Aumentar cobertura temática, autoridade orgânica e caminhos de entrada para páginas comerciais.";
  }
  if (/bio|mensagem|posicion|oferta|proposta de valor|percepcao/.test(subject)) {
    return "Aproximar o que a empresa entrega do que o mercado entende e aumentar diferenciação percebida.";
  }
  if (/reel|video|roteiro|post|carrossel|linha editorial|calendario|frequencia/.test(subject)) {
    return "Transformar presença e atenção em compreensão da oferta, recorrência e conversas qualificadas.";
  }
  return expectedResultForChannel(channelId);
}

function executionHowForAction(action: AcaoCanal, channelId: string) {
  const raw = text(action.como);
  const looksLikeEvidence = raw
    ? /^(sem\s|l[ií]der|\d+\s+resultado|site\s+est[aá]|nota\s|share\s|status\s|aus[eê]ncia|n[aã]o\s|dono:)/i.test(raw)
    : false;
  if (raw && !looksLikeEvidence) return raw;

  const subject = action.titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/serp|knowledge graph|sitelink|primeiro lugar|1º lugar|terceiros na marca/.test(subject)) {
    return "Otimizar os ativos próprios, dados estruturados, sinais de entidade e autoridade necessários para ampliar o controle da primeira página.";
  }
  if (/pagespeed|mobile|veloc|imagem|script|speed index|carregamento/.test(subject)) {
    return "Auditar o gargalo técnico, implementar a correção no site e comparar as métricas antes e depois da publicação.";
  }
  if (/llms|crawler|schema|chatgpt|gemini|perplexity|inteligencia artificial|\bia\b/.test(subject)) {
    return "Revisar acesso dos crawlers, dados estruturados, clareza da entidade e provas públicas usadas pelos mecanismos de IA.";
  }
  if (/review|avaliac|reclame|gmb|google meu negocio|maps|reput/.test(subject)) {
    return "Ajustar perfil, categorias, serviços, respostas e rotina de reputação; depois acompanhar visualizações, rotas e contatos gerados.";
  }
  if (/campanha|anuncio|ads|midia paga|lead|segmenta|remarketing/.test(subject)) {
    return "Estruturar hipótese, oferta, público, geografia, criativos, rastreamento e orçamento de teste antes de decidir por escala.";
  }
  if (/blog|artigo|keyword|palavra-chave|linkagem/.test(subject)) {
    return "Criar briefing, produzir ou atualizar o conteúdo, aplicar SEO on-page e conectar o tema às páginas comerciais por linkagem interna.";
  }
  if (/bio|mensagem|posicion|oferta|proposta de valor|percepcao/.test(subject)) {
    return "Reescrever a mensagem nos pontos de contato prioritários e validar se oferta, diferenciais, prova e próximo passo são compreendidos.";
  }
  if (/reel|video|roteiro|post|carrossel|linha editorial|calendario|frequencia|conteudo/.test(subject)) {
    return "Transformar o tema em briefing, roteiro, produção, distribuição e leitura de desempenho conectada ao objetivo comercial.";
  }
  return `Executar a correção no canal ${channelId}, com responsável, critério de aceite e comparação antes/depois.`;
}

function normalizedActionSubject(action: AcaoCanal, channelId: string) {
  return `${channelId} ${action.titulo} ${action.como || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function technicalActionFor(action: AcaoCanal, channelId: string) {
  const subject = normalizedActionSubject(action, channelId);
  if (/pagespeed|mobile|veloc|core web|performance|carregamento|imagem|script/.test(subject)) {
    return "Registrar as métricas atuais, corrigir o gargalo no código ou na infraestrutura e repetir o teste no celular e no desktop.";
  }
  if (/serp|busca|seo|keyword|palavra-chave|knowledge graph|sitelink|indexa/.test(subject)) {
    return "Revisar indexação, títulos, descrições, hierarquia de headings, dados estruturados e links internos; validar a publicação no Search Console.";
  }
  if (/llms|crawler|schema|chatgpt|gemini|perplexity|inteligencia artificial|\bia\b/.test(subject)) {
    return "Liberar os crawlers necessários, corrigir schema e sinais de entidade, publicar fontes rastreáveis e testar novamente as mesmas perguntas.";
  }
  if (/review|avaliac|reclame|gmb|google meu negocio|maps|reput/.test(subject)) {
    return "Completar categorias, serviços, links com UTM e dados do perfil; criar uma rotina de coleta, resposta e acompanhamento das avaliações.";
  }
  if (/campanha|anuncio|ads|midia paga|lead|segmenta|remarketing/.test(subject)) {
    return "Configurar eventos, UTMs, conversões e painel de acompanhamento; publicar um teste com orçamento, público e período definidos antes da escala.";
  }
  if (/cta|convers|formulario|whatsapp|landing|jornada/.test(subject)) {
    return "Reduzir etapas, destacar um único próximo passo, instrumentar o clique ou envio e testar o fluxo completo em celular e desktop.";
  }
  if (/instagram|tiktok|youtube|reel|video|post|carrossel|conteudo|blog|artigo/.test(subject)) {
    return "Organizar calendário, responsáveis, URLs rastreáveis e medição por peça; conferir formato, acessibilidade, publicação e destino do CTA.";
  }
  return "Definir responsável, registrar a situação atual, executar a alteração no canal e guardar a evidência de antes e depois.";
}

function editorialActionFor(action: AcaoCanal, channelId: string) {
  const subject = normalizedActionSubject(action, channelId);
  if (/pagespeed|mobile|veloc|core web|performance|carregamento|site|landing|convers|cta/.test(subject)) {
    return "Reescrever a abertura da página com oferta, benefício, prova e próximo passo claros; cortar blocos que atrasam a decisão sem acrescentar confiança.";
  }
  if (/serp|busca|seo|keyword|palavra-chave|knowledge graph|sitelink|indexa/.test(subject)) {
    return "Escolher uma intenção de busca por página e ajustar título, descrição, H1 e texto principal para responder à dúvida sem repetir palavras-chave artificialmente.";
  }
  if (/llms|crawler|schema|chatgpt|gemini|perplexity|inteligencia artificial|\bia\b/.test(subject)) {
    return "Publicar uma descrição objetiva da empresa, serviços, território, diferenciais e provas verificáveis; acrescentar perguntas frequentes com respostas diretas.";
  }
  if (/review|avaliac|reclame|gmb|google meu negocio|maps|reput/.test(subject)) {
    return "Responder cada avaliação a partir do caso relatado, sem texto-padrão, e transformar dúvidas recorrentes em informações claras no perfil e no site.";
  }
  if (/campanha|anuncio|ads|midia paga|lead|segmenta|remarketing/.test(subject)) {
    return "Criar variações por dor, objeção e prova, mantendo uma oferta e um CTA por anúncio; comparar mensagens antes de aumentar a verba.";
  }
  if (/bio|mensagem|posicion|oferta|proposta de valor|percepcao|diferenc/.test(subject)) {
    return "Explicar para quem é, qual problema resolve, por que escolher a empresa e o que fazer em seguida, usando exemplos e provas próprias.";
  }
  if (/instagram|tiktok|youtube|reel|video|roteiro|post|carrossel|conteudo|blog|artigo|editorial/.test(subject)) {
    return "Produzir a peça com gancho específico, desenvolvimento útil, prova concreta e CTA compatível com a etapa da jornada; eliminar frases genéricas e promessas sem sustentação.";
  }
  return "Revisar a mensagem para explicar o problema, a mudança proposta e o próximo passo em linguagem direta, apoiada por evidência da própria empresa.";
}

function ownerForAction(action: AcaoCanal, channelId: string) {
  const subject = normalizedActionSubject(action, channelId);
  if (/pagespeed|core web|performance|carregamento|schema|crawler|indexa|config|pixel|evento|analytics|tag/.test(subject)) {
    return "Desenvolvimento/SEO, com validação de Marketing";
  }
  if (/campanha|anuncio|ads|midia paga|remarketing|segmenta/.test(subject)) {
    return "Mídia paga, com apoio de Conteúdo e Comercial";
  }
  if (/review|avaliac|reclame|gmb|maps|reput/.test(subject)) {
    return "Atendimento/Operações, com revisão de Marketing";
  }
  if (/site|landing|convers|cta|oferta|posicion|bio/.test(subject)) {
    return "Marketing e Conteúdo, com apoio de Desenvolvimento";
  }
  return "Conteúdo/Marketing, com aprovação do responsável pelo negócio";
}

function doneWhenForAction(action: AcaoCanal, channelId: string) {
  const subject = normalizedActionSubject(action, channelId);
  if (/pagespeed|mobile|veloc|core web|performance|carregamento/.test(subject)) {
    return "A correção estiver publicada e o novo teste registrar melhora sem quebrar o fluxo principal.";
  }
  if (/serp|busca|seo|keyword|palavra-chave|knowledge graph|sitelink|indexa/.test(subject)) {
    return "A página estiver publicada, indexável, enviada ao Search Console e com posição e cliques acompanhados por 30 dias.";
  }
  if (/llms|crawler|schema|chatgpt|gemini|perplexity|inteligencia artificial|\bia\b/.test(subject)) {
    return "As fontes estiverem acessíveis e uma nova rodada das mesmas perguntas mostrar evolução de compreensão ou citação.";
  }
  if (/review|avaliac|reclame|gmb|google meu negocio|maps|reput/.test(subject)) {
    return "O perfil estiver completo, as avaliações da amostra respondidas e a rotina possuir responsável e prazo de resposta.";
  }
  if (/campanha|anuncio|ads|midia paga|lead|segmenta|remarketing/.test(subject)) {
    return "O teste encerrar com conversões rastreadas e dados suficientes para manter, ajustar ou interromper cada hipótese.";
  }
  if (/instagram|tiktok|youtube|reel|video|roteiro|post|carrossel|conteudo|blog|artigo|editorial/.test(subject)) {
    return "A peça estiver publicada, com CTA rastreável, e desempenho comparado à mediana das últimas publicações.";
  }
  return "A mudança estiver publicada, conferida pelo responsável e acompanhada por um indicador antes e depois.";
}

function clientFacingWhy(value: unknown) {
  const why = text(value);
  if (!why || /item do checklist em falha/i.test(why)) return null;
  return why;
}

function clientFacingIssueTitle(issue: Achado) {
  const clean = issue.label.trim();
  const normalized = clean.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/poucos terceiros na marca/.test(normalized)) return "Terceiros ocupam espaço relevante na busca de marca";
  if (/^site em 1[ºo]? lugar$/.test(normalized)) return "Site fora do 1º lugar na busca de marca";
  if (/^knowledge graph$/.test(normalized)) return "Painel de Knowledge Graph não detectado";
  if (/^sitelinks$/.test(normalized)) return "Sitelinks não detectados";
  if (issue.origem === "checklist" && !/^(sem|nao|ausencia|falta|baixo|pouco|erro|gap)/.test(normalized)) {
    const detail = String(issue.detalhe || "").toLowerCase();
    if (/ausente|n[aã]o detect|n[aã]o encontr|^sem\b|^0\b/.test(detail)) return `${clean} ausente ou não detectado`;
    return `${clean} abaixo do critério mínimo`;
  }
  return clean;
}

function problemTitleFromAction(action: AcaoCanal) {
  const title = action.titulo.replace(/^Corrigir:\s*/i, "").trim();
  const subjectLabel = (subject: string) => subject.charAt(0).toUpperCase() + subject.slice(1);
  const rules: Array<[RegExp, (subject: string) => string]> = [
    [/^otimizar\s+(.+)/i, (subject) => `Otimização insuficiente: ${subjectLabel(subject)}`],
    [/^melhorar\s+(.+)/i, (subject) => `${subjectLabel(subject)} abaixo do potencial`],
    [/^adicionar\s+(.+)/i, (subject) => `Ausência de ${subject}`],
    [/^criar\s+(.+)/i, (subject) => `Ausência de ${subject}`],
    [/^implementar\s+(.+)/i, (subject) => `${subject}: implementação pendente`],
    [/^fortalecer\s+(.+)/i, (subject) => `${subject}: presença insuficiente`],
    [/^reivindicar\s+(.+)/i, (subject) => `${subject}: reivindicação pendente`],
    [/^reescrever\s+(.+)/i, (subject) => `${subject}: mensagem ainda pouco clara`],
    [/^reduzir\s+(.+)/i, (subject) => `${subjectLabel(subject)} acima do nível desejado`],
    [/^aumentar\s+(.+)/i, (subject) => `${subjectLabel(subject)} abaixo do nível desejado`],
    [/^corrigir\s+(.+)/i, (subject) => `${subject}: falha identificada`],
  ];
  for (const [pattern, format] of rules) {
    const match = title.match(pattern);
    if (match?.[1]) return format(match[1]);
  }
  return `Lacuna identificada: ${title}`;
}

function clientFacingActionTitle(action: AcaoCanal) {
  const clean = action.titulo.replace(/^Corrigir:\s*/i, "").trim();
  const normalized = clean.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/poucos terceiros na marca/.test(normalized)) return "Reduzir a presença de terceiros na SERP de marca";
  if (/^site em 1[ºo]? lugar$/.test(normalized)) return "Levar o site ao 1º lugar na busca de marca";
  if (/^knowledge graph$/.test(normalized)) return "Estruturar a presença no Knowledge Graph";
  if (/^sitelinks$/.test(normalized)) return "Conquistar sitelinks relevantes na busca";
  if (/^(ajust|ampli|aplic|ativ|atualiz|conquist|corrig|cri|defin|desenvolv|estrutur|fech|fortalec|implement|inclu|melhor|otimiz|produz|public|reduz|refor[cç]|reivind|reescrev|test|usar|valid|vincul)/.test(normalized)) {
    return clean;
  }
  if (action.fonte === "checklist") {
    return `Corrigir ${clean.charAt(0).toLowerCase()}${clean.slice(1)}`;
  }
  return clean;
}

function sameDiagnosticTheme(a: string, b: string) {
  const normalize = (value: string) => value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^corrigir:\s*/i, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return false;
  if (left === right || left.includes(right) || right.includes(left)) return true;
  const leftTokens = new Set(left.split(" ").filter((token) => token.length > 3));
  const rightTokens = new Set(right.split(" ").filter((token) => token.length > 3));
  let overlap = 0;
  for (const token of leftTokens) if (rightTokens.has(token)) overlap += 1;
  return overlap >= 2 && overlap / Math.min(leftTokens.size || 1, rightTokens.size || 1) >= 0.65;
}

function diagnosticCategory(channelId: string, title: string, source: string) {
  const subject = `${title} ${source}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (/pagespeed|mobile|veloc|carregamento|core web|schema|crawler|indexa|tecnic|config|llms/.test(subject)) {
    return "Tecnologia e performance";
  }
  if (/cta|convers|formulario|whatsapp|landing|jornada|proximo passo/.test(subject)) {
    return "Conversão e jornada";
  }
  if (/serp|busca|seo|keyword|palavra-chave|knowledge graph|sitelink|google/.test(subject)) {
    return "Descoberta e busca";
  }
  if (/review|avaliac|reclame|reput|prova|depoimento|maps|gmb/.test(subject)) {
    return "Reputação e confiança";
  }
  if (/campanha|anuncio|ads|midia paga|remarketing|segmenta|lead/.test(subject)) {
    return "Aquisição paga";
  }
  if (/bio|mensagem|posicion|oferta|proposta de valor|percepcao|diferenc/.test(subject)) {
    return "Posicionamento e mensagem";
  }
  if (/blog|artigo|conteudo|post|reel|video|roteiro|carrossel|editorial|frequencia/.test(subject)) {
    return "Conteúdo e distribuição";
  }
  if (/metrica|analytics|tag|pixel|mensura|rastreamento|dashboard/.test(subject)) {
    return "Mensuração e dados";
  }

  const defaults: Record<string, string> = {
    site: "Experiência do site",
    busca: "Descoberta e busca",
    ia: "Visibilidade em IA",
    gmb: "Presença local e reputação",
    blog: "Conteúdo e autoridade",
    ads: "Aquisição paga",
    instagram: "Conteúdo e distribuição",
    tiktok: "Conteúdo e distribuição",
    youtube: "Conteúdo e autoridade",
    percepcao: "Posicionamento e mensagem",
    radar: "Inteligência competitiva",
  };
  return defaults[channelId] || "Presença digital";
}

function diagnosticScore(sourceScore: number | null, issues: RelatorioV2Issue[]) {
  if (sourceScore == null) return null;
  const penalty = issues.reduce((total, issue) => {
    if (issue.severity === "critico") return total + 8;
    if (issue.severity === "atencao") return total + 4;
    return total + 1.5;
  }, 0);
  const findingsCeiling = Math.max(45, Math.round(100 - Math.min(55, penalty)));
  return Math.min(Math.round(sourceScore), findingsCeiling);
}

function associationScore(issue: RelatorioV2Issue, action: RelatorioV2Action) {
  if (sameDiagnosticTheme(issue.title, action.title)) return 100;
  const normalizeTokens = (value: string) => value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 3);
  const issueTokens = new Set(normalizeTokens(`${issue.title} ${issue.evidence || ""}`));
  const actionTokens = normalizeTokens(`${action.title} ${action.how || ""}`);
  const overlap = actionTokens.filter((token) => issueTokens.has(token)).length;
  return overlap * 4 + (issue.category === action.category ? 6 : 0);
}

function pairProblemsAndSolutions(issues: RelatorioV2Issue[], actions: RelatorioV2Action[]) {
  const unused = new Set(actions.map((_, index) => index));
  return issues.map((problem) => {
    const available = unused.size ? [...unused] : actions.map((_, index) => index);
    const candidates = available
      .map((index) => ({ index, score: associationScore(problem, actions[index]) }))
      .sort((a, b) => b.score - a.score);
    const best = candidates[0];
    if (best) unused.delete(best.index);
    return {
      category: problem.category,
      problem,
      solution: best ? actions[best.index] : null,
    };
  });
}

function buildChannelDiagnostics(
  insights: CanalInsight[],
  opts: { reputationCollectionError: boolean; metaAdsActive: boolean },
): RelatorioV2ChannelDiagnostic[] {
  return insights
    .map((channel) => {
      const isUnvalidatedAds = channel.id === "ads" && !opts.metaAdsActive;
      const isUnvalidatedReputation = channel.id === "gmb" && opts.reputationCollectionError;
      const validationNote = isUnvalidatedAds
        ? "A biblioteca pública não encontrou anúncios ativos. Tratar como hipótese comercial até validar conta, verba e histórico."
        : isUnvalidatedReputation
          ? "A coleta de Reclame Aqui falhou; os demais sinais do Google continuam utilizáveis, mas reclamações exigem nova validação."
          : null;
      const publishableActions = channel.oQueFazer.filter((action) => Boolean(text(action.titulo)));
      const uniqueActionInputs = publishableActions.filter((action, index, all) => {
        const title = clientFacingActionTitle(action);
        return !all.slice(0, index).some((previous) => (
          sameDiagnosticTheme(clientFacingActionTitle(previous), title)
        ));
      });

      const explicitIssues = channel.listaErros
        .filter((issue) => issue.origem !== "pendente" && Boolean(text(issue.label)))
        .map((issue) => ({
          category: diagnosticCategory(channel.id, issue.label, issue.origem),
          title: clientFacingIssueTitle(issue),
          evidence: text(issue.detalhe),
          severity: issueSeverity(issue, channel.nota),
          origin: issue.origem,
        }));

      const issueSources = new Set(["melhoria", "checklist", "gap", "config", "percepcao", "oportunidade"]);
      const derivedIssues = uniqueActionInputs
        .filter((action) => issueSources.has(action.fonte))
        .filter((action) => !explicitIssues.some((issue) => sameDiagnosticTheme(issue.title, action.titulo)))
        .map((action) => ({
          category: diagnosticCategory(channel.id, action.titulo, action.fonte),
          title: action.fonte === "oportunidade"
            ? `Oportunidade ainda não explorada: ${action.titulo.replace(/^Corrigir:\s*/i, "")}`
            : problemTitleFromAction(action),
          evidence: text(action.porque) || text(action.como),
          severity: action.fonte === "oportunidade"
            ? "oportunidade" as const
            : normalizeLevel(action.impacto) === "alto"
              ? "critico" as const
              : "atencao" as const,
          origin: action.fonte,
        }));
      const issues = [...explicitIssues, ...derivedIssues];

      const actions = uniqueActionInputs.map((action) => ({
        category: diagnosticCategory(channel.id, action.titulo, action.fonte),
        title: clientFacingActionTitle(action),
        how: executionHowForAction(action, channel.id),
        why: clientFacingWhy(action.porque),
        technicalAction: technicalActionFor(action, channel.id),
        editorialAction: editorialActionFor(action, channel.id),
        owner: ownerForAction(action, channel.id),
        doneWhen: doneWhenForAction(action, channel.id),
        effort: normalizeLevel(action.esforco),
        impact: normalizeLevel(action.impacto),
        timeline: actionTimeline(action),
        expectedResult: expectedResultForAction(action, channel.id),
      }));
      const adjustedScore = diagnosticScore(isUnvalidatedAds ? null : channel.nota, issues);
      const scoreChanged = adjustedScore != null && channel.nota != null && adjustedScore < channel.nota;

      return {
        id: channel.id,
        label: channel.label,
        score: adjustedScore,
        sourceScore: isUnvalidatedAds ? null : channel.nota,
        scoreRationale: scoreChanged
          ? `A fonte atribuiu ${Math.round(Number(channel.nota))}/100. A nota diagnóstica foi recalibrada para ${adjustedScore}/100 porque há ${issues.length} achados que ainda exigem intervenção.`
          : null,
        status: validationNote ? "validar" as const : channel.status === "auditado" ? "auditado" as const : "parcial" as const,
        summary: text(channel.resumo),
        priority: text(channel.prioridade),
        strengths: channel.listaAcertos.map((item) => text(item.label)).filter((item): item is string => Boolean(item)),
        issues,
        actions,
        diagnosticItems: pairProblemsAndSolutions(issues, actions),
        expectedOutcome: text(channel.especialista?.visao_pos_ajuste) || expectedResultForChannel(channel.id),
        validationNote,
      };
    })
    .filter((channel) => channel.issues.length || channel.actions.length || channel.score != null);
}

function buildRoadmap(channels: RelatorioV2ChannelDiagnostic[]): RelatorioV2RoadmapPhase[] {
  const allCandidates = channels.flatMap((channel) => channel.actions.map((action) => ({ ...action, channel: channel.label })));
  const all = allCandidates.filter((action, index) => !allCandidates.slice(0, index).some((previous) => (
    sameDiagnosticTheme(previous.title, action.title)
  )));
  return [
    {
      id: "7" as const,
      label: "Primeiros 7 dias",
      objective: "Correções críticas, validações e quick wins que destravam o restante.",
      actions: all.filter((action) => action.timeline === "7 dias"),
    },
    {
      id: "15" as const,
      label: "Até 15 dias",
      objective: "Mensagem, ativos e rotinas que conectam presença à oportunidade comercial.",
      actions: all.filter((action) => action.timeline === "15 dias"),
    },
    {
      id: "30" as const,
      label: "Até 30 dias",
      objective: "Estruturas de maior esforço, testes e instrumentação para medir evolução.",
      actions: all.filter((action) => action.timeline === "30 dias"),
    },
  ];
}

function defaultKpi(channel: string) {
  const normalized = channel.toLowerCase();
  if (/busca|serp|seo/.test(normalized)) return "Posição e ocupação da busca de marca";
  if (/gmb|maps|review|reputa/.test(normalized)) return "Avaliação, resposta e conversão do perfil local";
  if (/ads|meta|midia/.test(normalized)) return "Custo por lead qualificado e consultas agendadas";
  if (/instagram|tiktok|youtube|conteudo/.test(normalized)) return "Conversas qualificadas geradas pelo canal";
  if (/site|landing|convers/.test(normalized)) return "Taxa de conversão para contato";
  return "Indicador do movimento antes e depois";
}

function defaultConsequence(channel: string) {
  const normalized = channel.toLowerCase();
  if (/busca|serp/.test(normalized)) return "Terceiros podem controlar a primeira impressão antes do acesso ao site.";
  if (/gmb|review|reputa/.test(normalized)) return "Sinais de confiança podem interromper a decisão antes do contato comercial.";
  if (/ads|meta|midia/.test(normalized)) return "O canal de aquisição ainda não tem hipótese e eficiência comprovadas.";
  if (/site|landing|convers/.test(normalized)) return "A demanda existente pode chegar sem um caminho claro para avançar.";
  return "A presença perde consistência ao longo da jornada do cliente.";
}

function scoreEvidence(channel: string, channels: CanalScore[]) {
  const normalized = channel.toLowerCase();
  const aliases: Record<string, string[]> = {
    busca: ["busca", "serp", "seo"],
    gmb: ["gmb", "maps", "google meu negocio", "reputa", "review"],
    ads: ["ads", "meta", "midia"],
    site: ["site", "landing", "convers"],
    instagram: ["instagram", "ig"],
    tiktok: ["tiktok"],
    youtube: ["youtube"],
    ia: ["ia", "llm", "chatgpt"],
  };
  const entry = Object.entries(aliases).find(([, values]) => values.some((alias) => normalized.includes(alias)));
  const found = channels.find((item) => item.id === entry?.[0]);
  if (found?.nota != null) return `${found.label}: ${Math.round(found.nota)}/100`;
  return "Evidência disponível no apêndice técnico";
}

function movementView(
  movement: MovimentoImpacto,
  index: number,
  channels: CanalScore[],
  opts: { reputationCollectionError: boolean; metaAdsActive: boolean },
): RelatorioV2Movement {
  const title = text(movement.titulo) || `Movimento ${index + 1}`;
  const channel = text(movement.canal) || "Presença";
  const blob = `${title} ${channel} ${movement.gap || ""}`.toLowerCase();
  const isReputation = /reputa|reclame|review|gmb|maps/.test(blob);
  const isAds = /ads|meta|midia paga/.test(blob);

  let confidence: RelatorioV2Confidence = "alta";
  let validationNote: string | null = null;
  let evidence = text(movement.evidencia) || scoreEvidence(channel, channels);

  if (isReputation && opts.reputationCollectionError) {
    confidence = "baixa";
    validationNote = "A coleta externa de reclamações falhou. Validar antes de tratar como conclusão.";
    evidence = "Reclame Aqui não validado nesta coleta";
  } else if (isAds && !opts.metaAdsActive) {
    confidence = "media";
    validationNote = "Canal não ativado. Validar oferta, verba, geografia e capacidade comercial antes do teste.";
    evidence = "Nenhum anúncio ativo do cliente foi identificado na coleta pública";
  } else if (!text(movement.evidencia)) {
    confidence = "media";
  }

  return {
    order: Number(movement.ordem) || index + 1,
    title,
    channel,
    gap: text(movement.gap) || "Gap identificado na jornada digital.",
    evidence,
    consequence: text(movement.consequencia) || defaultConsequence(channel),
    action: text(movement.acao_principal) || "Definir e executar a correção prioritária.",
    kpi: text(movement.kpi) || defaultKpi(channel),
    effort: normalizeLevel(movement.esforco),
    impact: normalizeLevel(movement.impacto || "alto"),
    confidence,
    validationNote,
  };
}

function buildStages(channels: CanalScore[], metaAdsActive: boolean): RelatorioV2Stage[] {
  const score = (id: string) => channels.find((channel) => channel.id === id)?.nota ?? null;
  const present = (ids: string[]) => ids
    .map((id) => channels.find((channel) => channel.id === id)?.label)
    .filter((label): label is string => Boolean(label));

  const distributionIds = metaAdsActive
    ? ["instagram", "tiktok", "youtube", "ads"]
    : ["instagram", "tiktok", "youtube"];

  return [
    {
      id: "descoberta",
      label: "Descoberta",
      score: roundedAverage([score("busca"), score("gmb"), score("ia")]),
      summary: "A marca aparece quando o mercado procura?",
      channels: present(["busca", "gmb", "ia"]),
    },
    {
      id: "confianca",
      label: "Confiança",
      score: roundedAverage([score("reviews"), score("gmb")]),
      summary: "As provas reduzem o risco percebido?",
      channels: present(["reviews", "gmb"]),
    },
    {
      id: "conversao",
      label: "Base de conversão",
      score: roundedAverage([score("site")]),
      summary: "Existe um caminho claro até o contato?",
      channels: present(["site"]),
    },
    {
      id: "distribuicao",
      label: "Distribuição",
      score: roundedAverage(distributionIds.map(score)),
      summary: metaAdsActive
        ? "Conteúdo e mídia sustentam a mensagem?"
        : "Conteúdo sustenta a mensagem; mídia ainda não foi validada.",
      channels: present(distributionIds),
    },
  ];
}

function buildCompetitors(items: CompetitorInput[]) {
  const direct = items
    .filter((item) => String(item.tipo || "").toLowerCase() === "concorrente")
    .sort((a, b) => Number(b.aparicoes || 0) - Number(a.aparicoes || 0));
  const visible = [
    ...direct.filter((item) => Number(item.aparicoes || 0) > 0),
    ...direct.filter((item) => Number(item.aparicoes || 0) <= 0),
  ].slice(0, RESEARCH_POLICY.maxDeepCompetitors);

  return visible.map((item) => ({
    name: text(item.nome) || text(item.dominio) || "Concorrente",
    domain: text(item.dominio),
    appearances: Number(item.aparicoes || 0),
    status: /confirm|aprov/.test(String(item.status || "").toLowerCase())
      ? "confirmado" as const
      : "validar" as const,
  }));
}

function buildContent(items: ContentInput[]) {
  const useful = items.filter((item) => {
    const title = text(item.titulo);
    return title && title.length >= 18;
  });
  const approved = useful.filter((item) => /aprov|pronto|public/.test(String(item.status || "").toLowerCase()));
  const chosen = (approved.length ? approved : useful).slice(0, 3);

  return chosen.map((item) => ({
    title: text(item.titulo) || "Peça",
    platform: text(item.plataforma) || "Canal a definir",
    funnelStage: text(item.etapa_funil) || "Consideração",
    status: text(item.status) || "Rascunho",
    angle: text(item.angulo),
  }));
}

function normalizeChannels(
  channels: CanalScore[],
  opts: { reputationCollectionError: boolean; metaAdsActive: boolean },
): CanalScore[] {
  return channels.map((channel) => {
    if (channel.id === "ads" && !opts.metaAdsActive) {
      return {
        ...channel,
        nota: null,
        status: "pendente",
        detalhe: "Canal não ativado · validar hipótese, verba e capacidade comercial",
      } satisfies CanalScore;
    }

    if (channel.id === "reviews") {
      const detalhe = String(channel.detalhe || "")
        .replace(/NPS\s*([+-]?\d+)/gi, "sentimento $1")
        .replace(/\s*·\s*RA\s*$/i, opts.reputationCollectionError ? " · RA não validado" : " · RA");
      return { ...channel, detalhe };
    }

    return channel;
  });
}

export function buildRelatorioV2(input: BuildRelatorioV2Input): RelatorioV2Data {
  const normalizedChannels = normalizeChannels(input.channels, {
    reputationCollectionError: Boolean(input.reputationCollectionError),
    metaAdsActive: Boolean(input.metaAdsActive),
  });
  const usableChannels = normalizedChannels.filter((channel) => channel.nota != null);
  const discoveryCandidates = usableChannels.filter((channel) => ["busca", "gmb", "ia", "site"].includes(channel.id));
  const trustCandidates = usableChannels.filter((channel) => ["reviews", "gmb", "instagram", "youtube", "tiktok"].includes(channel.id));
  const weakest = [...discoveryCandidates].sort((a, b) => Number(a.nota) - Number(b.nota))[0];
  const strongest = [...trustCandidates].sort((a, b) => Number(b.nota) - Number(a.nota))[0];
  const planSummary = text(input.plan?.diagnostico_executivo?.situacao);
  const planThesis = text(input.plan?.tese);

  const generatedThesis = strongest && weakest
    ? `A marca já construiu força em ${strongest.label}, mas ${weakest.label} limita a descoberta e a continuidade da jornada.`
    : "A presença digital tem ativos relevantes, mas precisa de prioridade para transformar atenção em oportunidade.";
  const thesis = planThesis && planThesis.length <= 150 ? planThesis : generatedThesis;
  const summaryBase = planSummary || thesis;
  const mentionsInactiveAds = /(?:aus[eê]ncia|n[aã]o possui|sem).*(?:m[ií]dia paga|campanhas?|an[uú]ncios?)|(?:m[ií]dia paga|campanhas?|an[uú]ncios?).*(?:ausente|inativ|n[aã]o possui|sem)/i.test(summaryBase);
  const executiveSummary = !input.metaAdsActive && mentionsInactiveAds
    ? `${input.company} já possui ativos digitais relevantes, mas ${weakest?.label || "a descoberta"} ainda limita a continuidade da jornada. Em mídia paga, a coleta pública não encontrou campanhas ativas; isso indica uma hipótese de oportunidade a validar, não uma falha comprovada.`
    : summaryBase;

  const decision = weakest
    ? `Priorizar ${weakest.label.toLowerCase()} sem dispersar investimento nos canais que já apresentam boa base.`
    : "Validar as evidências e escolher um movimento principal para os próximos 30 dias.";

  const movements = (input.plan?.movimentos || [])
    .slice(0, 3)
    .map((movement, index) => movementView(movement, index, normalizedChannels, {
      reputationCollectionError: Boolean(input.reputationCollectionError),
      metaAdsActive: Boolean(input.metaAdsActive),
    }));

  const reputation = input.reputation
    ? {
        rating: input.reputation.perfil?.avaliacao ?? null,
        reviewCount: input.reputation.perfil?.total_avaliacoes ?? null,
        sentimentIndex: input.reputation.nps?.nps ?? null,
        sentimentSample: input.reputation.nps?.amostra ?? null,
        positiveThemes: (input.reputation.nps?.temas || [])
          .filter((item) => item.polaridade === "positivo")
          .slice(0, 3)
          .map((item) => item.tema),
        negativeThemes: [
          ...(input.reputation.analise_mensagens?.dores || []),
          ...(input.reputation.nps?.temas || [])
            .filter((item) => item.polaridade === "negativo")
            .map((item) => item.tema),
        ].slice(0, 3),
        reclameAquiStatus: input.reputationCollectionError
          ? "nao_validado" as const
          : input.reputation.reclame_aqui?.encontrado
            ? "validado" as const
            : "nao_encontrado" as const,
      }
    : null;
  const channelDiagnostics = buildChannelDiagnostics(input.channelInsights || [], {
    reputationCollectionError: Boolean(input.reputationCollectionError),
    metaAdsActive: Boolean(input.metaAdsActive),
  });
  const diagnosticById = new Map(channelDiagnostics.map((channel) => [channel.id, channel]));
  const presentationChannels = normalizedChannels.map((channel) => {
    const diagnostic = diagnosticById.get(channel.id);
    if (!diagnostic) return channel;
    return {
      ...channel,
      nota: diagnostic.score,
      detalhe: diagnostic.scoreRationale
        ? `${channel.detalhe} · nota recalibrada pelos achados`
        : channel.detalhe,
    } satisfies CanalScore;
  });
  const presentationAverage = roundedAverage(presentationChannels.map((channel) => channel.nota));
  const presentationOverall = input.scoreOverall == null
    ? presentationAverage
    : presentationAverage == null
      ? input.scoreOverall
      : Math.min(Math.round(input.scoreOverall), presentationAverage);
  const allIssues = channelDiagnostics.flatMap((channel) => channel.issues);
  const allActions = channelDiagnostics.flatMap((channel) => channel.actions);
  const competitorInputs = input.competitors || [];
  const competitors = buildCompetitors(competitorInputs);
  const mappedCompetitors = competitorInputs.filter(
    (item) => String(item.tipo || "").toLowerCase() === "concorrente",
  ).length;

  return {
    id: input.id,
    company: input.company,
    url: input.url,
    niche: text(input.niche),
    generatedAt: input.generatedAt || new Date().toISOString(),
    thesis,
    executiveSummary,
    decision,
    overallScore: presentationOverall,
    channels: presentationChannels,
    stages: buildStages(presentationChannels, Boolean(input.metaAdsActive)),
    strengths: presentationChannels
      .filter((channel) => channel.nota != null && channel.nota >= 75 && channel.id !== "site")
      .sort((a, b) => Number(b.nota) - Number(a.nota))
      .slice(0, 3),
    movements,
    competitors,
    competitorScope: {
      mapped: mappedCompetitors,
      analyzed: competitors.length,
      postLimit: RESEARCH_POLICY.maxPostsPerCompetitor,
      commentsLimit: RESEARCH_POLICY.maxCommentsPerCompetitor,
    },
    reputation,
    content: buildContent(input.content || []),
    doNotDoNow: (input.plan?.nao_fazer_agora || []).map(text).filter((item): item is string => Boolean(item)).slice(0, 3),
    qualityNotes: input.qualityNotes || [],
    diagnosticScope: {
      auditedChannels: channelDiagnostics.length,
      totalProblems: allIssues.length,
      criticalProblems: allIssues.filter((issue) => issue.severity === "critico").length,
      totalActions: allActions.length,
      highImpactActions: allActions.filter((action) => action.impact === "alto").length,
    },
    channelDiagnostics,
    roadmap: buildRoadmap(channelDiagnostics),
  };
}
