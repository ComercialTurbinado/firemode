/** Glossário curto — termos técnicos da apresentação de presença. */

export type GlossarioItem = {
  /** Forma canônica exibida no tooltip */
  termo: string;
  /** Explicação em linguagem de cliente (1–2 frases). */
  meaning: string;
};

/** Chaves em minúsculas; matching no texto é case-insensitive. */
export const GLOSSARIO: Record<string, GlossarioItem> = {
  lcp: {
    termo: "LCP",
    meaning:
      "Largest Contentful Paint — tempo até o maior conteúdo da tela aparecer. Ideal abaixo de ~2,5s no celular.",
  },
  cls: {
    termo: "CLS",
    meaning:
      "Cumulative Layout Shift — quanto a página “pula” enquanto carrega. Ideal perto de zero (sem empurrões de layout).",
  },
  tbt: {
    termo: "TBT",
    meaning:
      "Total Blocking Time — quanto o JavaScript trava a tela e atrasa cliques. Quanto menor, mais responsivo o site.",
  },
  fcp: {
    termo: "FCP",
    meaning:
      "First Contentful Paint — quando o primeiro texto ou imagem aparece. Primeira impressão de velocidade.",
  },
  tti: {
    termo: "TTI",
    meaning:
      "Time to Interactive — quando a página fica de fato clicável e utilizável, não só “pintada”.",
  },
  "speed index": {
    termo: "Speed Index",
    meaning:
      "Quão rápido o conteúdo visível da tela se preenche. Quanto menor o número, melhor a percepção de velocidade.",
  },
  pagespeed: {
    termo: "PageSpeed Insights",
    meaning:
      "Ferramenta do Google que mede desempenho, acessibilidade e SEO da página (lab + dados reais de usuários quando há).",
  },
  "pagespeed insights": {
    termo: "PageSpeed Insights",
    meaning:
      "Ferramenta do Google que mede desempenho, acessibilidade e SEO da página (lab + dados reais de usuários quando há).",
  },
  crux: {
    termo: "CrUX",
    meaning:
      "Chrome User Experience Report — dados reais de velocidade coletados de usuários Chrome, não só teste de laboratório.",
  },
  "field data": {
    termo: "Field data",
    meaning:
      "Métricas reais de usuários (CrUX). Diferente do lab, que é um teste simulado em condições controladas.",
  },
  "knowledge graph": {
    termo: "Knowledge Graph",
    meaning:
      "Painel lateral/topo do Google com ficha da empresa (nome, logo, site, redes). Sinal de que o Google “reconhece” a marca.",
  },
  serp: {
    termo: "SERP",
    meaning:
      "Search Engine Results Page — a página de resultados do Google para uma busca.",
  },
  https: {
    termo: "HTTPS",
    meaning:
      "Conexão segura (cadeado). Sem HTTPS o navegador e o Google tratam o site como menos confiável.",
  },
  schema: {
    termo: "Schema",
    meaning:
      "Dados estruturados no código que ajudam o Google a entender o negócio (tipo LocalBusiness, FAQ, etc.).",
  },
  sitemap: {
    termo: "Sitemap",
    meaning:
      "Mapa de URLs do site (XML) que facilita o Google descobrir e indexar as páginas.",
  },
  robots: {
    termo: "robots.txt",
    meaning:
      "Arquivo que diz aos robôs do Google o que podem ou não rastrear no site.",
  },
  "llms.txt": {
    termo: "llms.txt",
    meaning:
      "Arquivo na raiz do site (como um mapa em texto) que ajuda assistentes de IA a entender a marca, a oferta e as páginas importantes.",
  },
  "crawlers de ia": {
    termo: "Crawlers de IA",
    meaning:
      "Robôs de ChatGPT, Claude, Google e Perplexity. Se o robots.txt bloquear, a marca some das respostas de IA.",
  },
  "visibilidade em ia": {
    termo: "Visibilidade em IA",
    meaning:
      "Se ChatGPT, Gemini ou Perplexity recomendam ou citam a marca quando alguém pergunta no nicho — e o que falta pra aparecer.",
  },
  posicionamento: {
    termo: "Posicionamento",
    meaning:
      "Como a marca se apresenta vs os rivais: bio, headline do site e CTAs — o que promete, o que pede e o que sobra de espaço no mercado.",
  },
  audiencia: {
    termo: "Audiência ideal",
    meaning:
      "Quem mais compra o produto/serviço (3 personas) e quem evitar — demografia, motivação, como falar e o que converte. Cruza site, Instagram, Google e IAs.",
  },
  canonical: {
    termo: "Canonical",
    meaning:
      "URL “oficial” da página. Evita conteúdo duplicado quando a mesma página existe em vários endereços.",
  },
  viewport: {
    termo: "Viewport",
    meaning:
      "Meta tag que adapta o layout ao celular. Sem ela, o site parece “zoomado” no mobile.",
  },
  "open graph": {
    termo: "Open Graph",
    meaning:
      "Tags OG (título, descrição, imagem) que controlam o preview ao compartilhar o link no WhatsApp, LinkedIn, etc.",
  },
  og: {
    termo: "OG",
    meaning:
      "Open Graph — tags de preview (título, descrição, imagem) ao compartilhar o link em redes e WhatsApp.",
  },
  cta: {
    termo: "CTA",
    meaning:
      "Call to Action — o pedido claro de próximo passo (WhatsApp, orçamento, agendar, comprar).",
  },
  nap: {
    termo: "NAP",
    meaning:
      "Name, Address, Phone — nome, endereço e telefone iguais em site, Google Meu Negócio e diretórios. Inconsistência prejudica busca local.",
  },
  gmb: {
    termo: "GMB",
    meaning:
      "Google Meu Negócio (Google Business Profile) — o perfil da empresa no Maps e na busca local.",
  },
  "google meu negócio": {
    termo: "Google Meu Negócio",
    meaning:
      "Perfil da empresa no Google Maps / busca local (hoje Google Business Profile): horário, reviews, fotos, posts.",
  },
  "meta description": {
    termo: "Meta description",
    meaning:
      "Resumo da página que o Google pode mostrar abaixo do título nos resultados de busca.",
  },
  "core web vitals": {
    termo: "Core Web Vitals",
    meaning:
      "Conjunto de métricas de experiência do Google (inclui LCP, CLS e INP) que influenciam ranking e percepção de qualidade.",
  },
  a11y: {
    termo: "A11y",
    meaning:
      "Acessibilidade — se pessoas com deficiência (visão, teclado, leitores de tela) conseguem usar o site.",
  },
  "best practices": {
    termo: "Best practices",
    meaning:
      "Boas práticas de segurança e web modernas (HTTPS, sem libs vulneráveis, etc.) no PageSpeed.",
  },
  "ad library": {
    termo: "Ad Library",
    meaning:
      "Biblioteca pública da Meta com anúncios ativos de Facebook/Instagram — dá para ver o que a marca e concorrentes anunciam.",
  },
  reels: {
    termo: "Reels",
    meaning:
      "Vídeos curtos verticais do Instagram — formato principal de alcance orgânico hoje.",
  },
  engajamento: {
    termo: "Engajamento",
    meaning:
      "Interações (curtidas, comentários, compartilhamentos, salvamentos) em relação ao tamanho da audiência.",
  },
};

/** Padrões longos primeiro para não “roubar” matches curtos. */
export const GLOSSARIO_PADROES: { key: string; re: RegExp }[] = Object.keys(GLOSSARIO)
  .sort((a, b) => b.length - a.length)
  .map((key) => ({
    key,
    // Sem lookbehind (compat); captura prefixo opcional + termo
    re: new RegExp(
      `(^|[^\\wÀ-ÿ])(${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![\\wÀ-ÿ])`,
      "gi",
    ),
  }));
