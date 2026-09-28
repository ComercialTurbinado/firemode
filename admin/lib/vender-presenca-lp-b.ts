/**
 * Copy e oferta da variante A/B B — LP /vender/presenca/b
 * Esteira: 197 → 297 → 497 (recomendado) → Enterprise
 * Sem garantia. 7 dias de conteúdo = Pacote Ativo (nível 3).
 */

export const PRESENCA_B_SEO = {
  title: "Diagnóstico de Presença Digital | Firemode",
  description:
    "Veja como sua empresa é encontrada e comparada. Receba uma análise objetiva e, no Pacote Ativo, sete roteiros baseados no seu negócio.",
} as const;

export const PRESENCA_B_HERO = {
  subtitulo:
    "Uma empresa pode atender bem e ainda parecer pouco confiável quando alguém a encontra pela primeira vez. Nós verificamos o que o cliente vê e indicamos o que merece ser corrigido primeiro.\n\n" +
    "Envie seu site ou Instagram. A análise inicial não exige senha.",
  cta: "Quero analisar meu caso",
  form_footer:
    "Você escolhe entre uma leitura breve, um diagnóstico completo ou um pacote que também inclui sete roteiros.\n\n" +
    "Se você só tem Instagram, começamos por ele. Não precisamos entrar na sua conta.",
} as const;

export const PRESENCA_B_DIFERENCIAL =
  "No Pacote Ativo, a análise vem acompanhada de sete roteiros escritos a partir do seu serviço, das perguntas dos clientes e do jeito de falar da empresa. Assim você consegue testar as recomendações em vez de guardar mais um documento.";

export const PRESENCA_B_DORES = [
  {
    t: "Uma lista de erros não resolve o trabalho",
    text: "Saber que a bio está fraca ou que o site precisa melhorar ainda deixa a parte difícil com você: decidir o que fazer, escrever e publicar.",
  },
  {
    t: "O assunto precisa nascer do seu negócio",
    text: "Um bom roteiro considera o serviço vendido, as dúvidas que chegam no atendimento e o modo como concorrentes tratam o mesmo tema. Tendência, sozinha, não dá essa resposta.",
  },
  {
    t: "Produzir mais não significa comunicar melhor",
    text: "Ferramentas automáticas aceleram a escrita, mas repetem fórmulas quando não recebem contexto suficiente. O texto precisa carregar situações, argumentos e escolhas próprias da sua empresa.",
  },
] as const;

export const PRESENCA_B_DOR_TITULO = {
  title: "O diagnóstico precisa ajudar na segunda-feira.",
  titleAccent: "Não apenas parecer completo.",
  titleMuted:
    "Se a recomendação não mostra o que deve mudar e como começar, ela só transfere o problema para você.",
} as const;

export const PRESENCA_B_COMO = {
  kicker: "Como funciona",
  title: "A análise termina com uma ordem de trabalho.",
  titleAccent: "Você sabe por onde começar.",
  sub: "Primeiro observamos o que está público. Depois comparamos sua apresentação com a dos concorrentes e organizamos as correções por importância.",
  passos: [
    {
      n: "01",
      t: "A visão de quem está do lado de fora",
      d: "Acessamos os mesmos resultados, perfis e páginas que um possível cliente encontra. Não é necessário fornecer senha.",
    },
    {
      n: "02",
      t: "Comparação com alternativas reais",
      d: "Observamos empresas que disputam o mesmo cliente e registramos onde elas tornam a escolha mais fácil.",
    },
    {
      n: "03",
      t: "Recomendação compatível com o pacote",
      d: "A entrega vai de uma orientação breve a um diagnóstico com textos e sete roteiros preparados para publicação.",
    },
  ],
} as const;

export type PresencaBTier = {
  nivel: string;
  nome: string;
  preco: string;
  descricao: string;
  entregas: readonly string[];
  cta: string;
  hot: boolean;
  badge?: string;
};

export const PRESENCA_B_ESTEIRA: readonly PresencaBTier[] = [
  {
    nivel: "1",
    nome: "Radar de Entrada",
    preco: "R$ 197",
    descricao: "Entrada rápida pra ver o método na prática.",
    entregas: [
      "Leitura rápida da presença (site ou Instagram)",
      "Principais problemas encontrados",
      "Primeiro direcionamento do que corrigir",
    ],
    cta: "Começar com o Radar",
    hot: false,
  },
  {
    nivel: "2",
    nome: "Diagnóstico Essencial",
    preco: "R$ 297",
    descricao: "Análise detalhada com uma ordem de correção.",
    entregas: [
      "Análise completa da presença",
      "Plano inicial de correção priorizado",
      "Textos-base (bio, headlines, CTAs)",
    ],
    cta: "Quero o Essencial",
    hot: false,
  },
  {
    nivel: "3",
    nome: "Pacote Firemode Ativo",
    preco: "R$ 497",
    descricao: "Diagnóstico completo, textos e sete roteiros para publicação.",
    entregas: [
      "Análise de site, busca, perfil no Google, redes e IA",
      "Correções organizadas por importância",
      "Sete roteiros de reels escritos a partir do seu serviço e das dúvidas dos clientes",
      "Monitoramento de concorrentes",
    ],
    cta: "Quero o Pacote Ativo",
    hot: true,
    badge: "Recomendado",
  },
  {
    nivel: "4",
    nome: "Firemode Enterprise",
    preco: "Sob consulta",
    descricao: "Acompanhamento dedicado para operações com maior volume.",
    entregas: [
      "Escopo e ritmo sob medida",
      "Monitoramento avançado contínuo",
      "Responsável dedicado pela operação",
    ],
    cta: "Solicitar orçamento",
    hot: false,
  },
] as const;

export const PRESENCA_B_PRECO = {
  kicker: "Investimento",
  title: "Escolha o seu nível de entrada",
  sub: "Do Radar ao Pacote Ativo (R$ 497) — ou Enterprise sob medida.",
} as const;

export const PRESENCA_B_ENTREGA = {
  kicker: "O que você recebe",
  title: "Cada pacote resolve uma parte diferente.",
  sub: "O Pacote Ativo inclui o diagnóstico, os textos principais e sete roteiros. Os pacotes de entrada têm um escopo menor e um preço menor.",
} as const;

export const PRESENCA_B_ENTREGAVEIS = [
  {
    n: "01",
    t: "A análise",
    d: "O que uma pessoa encontra, onde surgem dúvidas e quais concorrentes aparecem na mesma comparação.",
  },
  {
    n: "02",
    t: "Como resolver",
    d: "Uma lista ordenada de correções, com justificativa para cada prioridade.",
  },
  {
    n: "03",
    t: "Os textos",
    d: "Bio, títulos e chamadas escritos a partir do serviço, do público e das dúvidas encontradas na análise.",
  },
  {
    n: "04",
    t: "7 roteiros escritos para a empresa",
    d: "No Pacote Ativo, cada roteiro parte de uma dúvida, situação ou argumento ligado ao serviço. O texto é revisto para evitar fórmulas repetidas e palavras que a empresa não usaria.",
  },
  {
    n: "05",
    t: "Monitoramento de concorrentes",
    d: "No Pacote Ativo, acompanhamos como empresas que disputam o mesmo cliente apresentam seus serviços.",
  },
  {
    n: "06",
    t: "Consultor de vídeo",
    d: "Envie o vídeo pelo WhatsApp e diga o que chamou sua atenção. Devolvemos título, roteiro e legenda adaptados ao seu serviço e ao vocabulário da empresa.",
    bonus: true,
  },
] as const;

export const PRESENCA_B_INTERESSE = {
  kicker: "Começar",
  title: "Envie seu site ou Instagram",
  sub: "Conte o que sua empresa vende e onde costuma divulgar. A partir disso, explicamos qual pacote combina com a necessidade relatada.",
} as const;

export const PRESENCA_B_FAQ = [
  {
    q: "O que eu recebo exatamente?",
    a: "Depende do nível. Radar (R$ 197): leitura rápida + direcionamento. Essencial (R$ 297): análise completa + plano + textos-base. Pacote Ativo (R$ 497): tudo isso + 7 roteiros/semana + monitoramento de concorrentes. Enterprise sob consulta.",
  },
  {
    q: "Por que 7 dias de conteúdo e não um PDF?",
    a: "Porque o roteiro permite colocar parte da recomendação em prática. No Pacote Ativo, os sete temas são definidos a partir do seu serviço, das dúvidas do público e do que foi encontrado na análise.",
  },
  {
    q: "Como funciona o consultor de vídeo?",
    a: "Envie o vídeo pelo WhatsApp e explique o que chamou sua atenção. Nós adaptamos a ideia ao seu serviço e devolvemos título, roteiro e legenda.",
  },
  {
    q: "Precisa da senha do Instagram?",
    a: "Não para a análise. Queremos avaliar a mesma experiência que qualquer pessoa encontra sem estar conectada à sua conta.",
  },
  {
    q: "Quanto custa e em quanto tempo?",
    a: "Radar R$ 197 · Essencial R$ 297 · Pacote Ativo R$ 497 · Enterprise sob consulta. Primeira entrega do Pacote Ativo em até 7 dias úteis.",
  },
  {
    q: "Vocês só entregam o relatório?",
    a: "Não. A partir do Essencial, você recebe a ordem de correção e os textos principais. O Pacote Ativo também inclui sete roteiros.",
  },
  {
    q: "Vocês olham se a IA recomenda a marca?",
    a: "Sim. No Pacote Ativo, fazemos perguntas relacionadas ao serviço e registramos as respostas encontradas no ChatGPT, Gemini e Perplexity. É uma amostra daquele momento, não uma garantia de citação.",
  },
  {
    q: "Não tenho site. Serve?",
    a: "Serve. Podemos começar pelo Instagram, pelo perfil no Google e pelos demais resultados públicos. A análise dirá se criar um site deve ou não vir primeiro.",
  },
  {
    q: "Já tenho agência. Isso atrapalha?",
    a: "Não. O diagnóstico pode orientar o trabalho da sua agência. Se houver sobreposição de responsabilidade, ela será apontada antes da contratação.",
  },
] as const;
