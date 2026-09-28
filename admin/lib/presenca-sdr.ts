/**
 * SDR + Closer da LP /vender/presenca
 * Contato = formulário na espera. Conversa = DeepSeek (mais eficiente).
 */

import {
  PRESENCA_PRECO_LABEL,
  PRESENCA_VALOR_ANCORA_LABEL,
} from "@/lib/vender-presenca-ab";

export type PresencaLeadChat = {
  nome: string;
  email: string;
  whatsapp: string;
  /** Opcional — só se a pessoa citar sozinha ou no fim */
  presence?: string;
};

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatPhase = "discovery" | "pitch" | "closer";

export const PRESENCA_SDR_SYSTEM = `Você atende possíveis clientes da Firemode pelo chat da página.
A pessoa entrou para entender se o serviço serve ao negócio dela. Converse como um profissional atento, sem interpretar um personagem de vendas.

## Formato OBRIGATÓRIO
Responda APENAS JSON válido (sem markdown):
{"bubbles":["frase 1","frase 2"]}

Regras das bubbles:
- Use 1 ou 2 bubbles. Use 3 apenas quando isso for realmente necessário.
- Escreva frases completas e naturais. Não fragmente uma mesma ideia para simular conversa humana.
- Faça uma pergunta por vez e somente quando a resposta ajudar a conversa.
- Use português brasileiro simples, sem emojis, bordões ou intimidade forçada.
- Não use respostas automáticas como “perfeito”, “show”, “faz total sentido”, “entendi sua dor” ou “ótima pergunta”.
- Não use “estratégico”, “transformar”, “potencializar”, “jornada”, “gargalo”, “360°”, “sair do achismo”, “escalar” ou “desbloquear resultados”.
- Não invente urgência, escassez, resultado, prova ou informação que a pessoa não forneceu.
- Não escreva listas longas, markdown nem mencione que é uma IA.

## Como conduzir a conversa
1) Use o primeiro nome sem repeti-lo em todas as respostas.
2) Entenda o que a empresa vende e como os clientes costumam chegar.
3) Pergunte o que já foi tentado e o que motivou a conversa hoje.
4) Retome detalhes concretos da resposta da pessoa. Não devolva um resumo genérico.
5) Explique apenas a parte do serviço que responde ao problema relatado.
6) Se ainda faltar contexto, diga isso. Não diagnostique antes da hora.
7) Convide para o WhatsApp quando houver um próximo passo claro, sem pressionar.

NÃO peça site no começo. Se ela mencionar site/@ sozinha, use. Se no pitch fizer sentido, pode perguntar “tem site ou só Instagram?” — depois de já saber o negócio e a dor.

## Informações corretas sobre a oferta
- A Firemode verifica como a empresa aparece na busca, nos perfis, no site e nas respostas de IA.
- O projeto escolhe uma correção prioritária e executa esse trabalho em 30 dias.
- Antes de começar, registra um indicador; no final, mostra o que mudou e o que não pode ser atribuído ao projeto.
- Os contatos comerciais também podem ser organizados para que cada interessado tenha uma próxima ação.
- O projeto piloto custa ${PRESENCA_PRECO_LABEL}. O valor previsto após as vagas-piloto é ${PRESENCA_VALOR_ANCORA_LABEL}.
- A primeira apresentação acontece em até 7 dias; o projeto completo termina em 30 dias.
- Não existe promessa de aumento de vendas, reembolso por resultado ou renovação automática.

## Fases
Veja a instrução de fase no system seguinte.
`;

export function buildLeadContext(lead: PresencaLeadChat): string {
  return [
    `Nome: ${lead.nome}`,
    `E-mail: ${lead.email}`,
    `WhatsApp: ${lead.whatsapp}`,
    `Site/Instagram (só se já souber): ${lead.presence?.trim() || "ainda não informado — NÃO peça agora"}`,
  ].join("\n");
}

export function conversationPhase(
  history: { role: string; content: string }[],
): ChatPhase {
  const userTurns = history.filter((m) => m.role === "user").length;
  if (userTurns >= 6) return "closer";
  if (userTurns >= 4) return "pitch";
  return "discovery";
}

export function phaseInstruction(phase: ChatPhase): string {
  if (phase === "closer") {
    return "FASE DE PRÓXIMO PASSO: responda a dúvida diretamente. Se houver interesse claro, explique por que vale continuar no WhatsApp e faça o convite sem pressão.";
  }
  if (phase === "pitch") {
    return "FASE DE EXPLICAÇÃO: relacione um detalhe concreto que a pessoa contou a uma parte do serviço. Não recite o pacote inteiro. Faça uma pergunta apenas se faltar informação importante.";
  }
  return "FASE INICIAL: entenda o negócio e o motivo da conversa. Responda ao que a pessoa realmente disse e faça uma pergunta simples. Ainda não apresente preço nem recite a oferta.";
}

/** Abertura humana — cumprimenta pelo nome e começa discovery (sem pedir site) */
export function openingDiscovery(lead: PresencaLeadChat): string[] {
  const first = lead.nome.trim().split(/\s+/)[0] || "Oi";
  return [
    `Oi, ${first}. Que tipo de serviço sua empresa oferece?`,
  ];
}

/** @deprecated use openingDiscovery */
export function openingAfterQualify(lead: PresencaLeadChat): string[] {
  return openingDiscovery(lead);
}

export function parseBubbles(raw: string): string[] {
  const trimmed = raw.trim();
  try {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { bubbles?: unknown };
      if (Array.isArray(parsed.bubbles)) {
        const bubbles = parsed.bubbles
          .filter((b): b is string => typeof b === "string")
          .map((b) => b.trim())
          .filter(Boolean)
          .slice(0, 3);
        if (bubbles.length) return bubbles;
      }
    }
  } catch {
    /* fall through */
  }

  if (trimmed.includes("|||")) {
    return trimmed
      .split("|||")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  return splitLongMessage(trimmed);
}

export function splitLongMessage(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 110) return [clean];

  const parts: string[] = [];
  const sentences = clean.split(/(?<=[.!?…])\s+/);
  let buf = "";
  for (const s of sentences) {
    if (!s) continue;
    if ((buf + " " + s).trim().length > 100 && buf) {
      parts.push(buf.trim());
      buf = s;
    } else {
      buf = buf ? `${buf} ${s}` : s;
    }
    if (parts.length >= 2 && buf) {
      parts.push(buf.trim());
      buf = "";
      break;
    }
  }
  if (buf) parts.push(buf.trim());
  return parts.slice(0, 3);
}

/**
 * Fallback mínimo — só se DeepSeek e GPT falharem.
 * Continua no modo discovery (nunca pede site de primeira).
 */
export function fallbackSdrReplies(
  userText: string,
  lead: PresencaLeadChat,
  phase: ChatPhase = "discovery",
): string[] {
  const t = userText.toLowerCase();
  const first = lead.nome.trim().split(/\s+/)[0] || "você";

  if (/sim|quero|vamos|fechado|pode ser|bora|fechar|comprar|começar|comecar/.test(t)) {
    return [
      `${first}, o projeto piloto custa ${PRESENCA_PRECO_LABEL} e termina em 30 dias.`,
      "Se quiser continuar, posso levar os dados desta conversa para o WhatsApp.",
    ];
  }

  if (/preço|preco|valor|custa|quanto|497/.test(t)) {
    return [
      `O projeto piloto custa ${PRESENCA_PRECO_LABEL}. Depois das três primeiras vagas, o valor previsto é ${PRESENCA_VALOR_ANCORA_LABEL}.`,
      phase === "closer"
        ? "Quer continuar a conversa no WhatsApp?"
        : "O que fez você procurar esse tipo de trabalho agora?",
    ];
  }

  if (phase === "closer") {
    return [
      `${first}, posso esclarecer mais alguma parte do projeto antes de continuarmos?`,
    ];
  }

  if (phase === "pitch") {
    return [
      "Pelo que você contou, primeiro precisaríamos verificar onde essa procura está se perdendo.",
      "Hoje você acompanha quantos contatos chegam pelas redes ou pelo site?",
    ];
  }

  // discovery
  if (/clínica|loja|serviço|servico|curso|imob|advog|dent|estét|salon|restaur|coach|consult/.test(t)) {
    return [
      "Como esses clientes costumam encontrar sua empresa hoje?",
    ];
  }
  if (/instagram|rede|post|reels|stories|carrossel/.test(t)) {
    return [
      "Você publica com algum objetivo definido, como gerar conversas, pedidos de orçamento ou visitas?",
    ];
  }
  if (/vez|semana|dia|raro|nunca|sempre|frequ/.test(t)) {
    return [
      "Quando alguém demonstra interesse, você consegue saber de qual publicação ou canal essa pessoa veio?",
    ];
  }

  return [
    `${first}, conte um pouco sobre o que sua empresa vende e por que você procurou a Firemode hoje.`,
  ];
}
