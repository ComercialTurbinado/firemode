/** WhatsApp comercial + mensagem de proposta da apresentação. */

export type CanalMarcado = { id: string; label: string };

export function comercialWhatsapp(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_COMERCIAL_WHATSAPP ||
    process.env.COMERCIAL_WHATSAPP ||
    "";
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

export function buildMensagemProposta(opts: {
  empresa: string;
  modo: "marcado" | "tudo";
  canais: CanalMarcado[];
  analiseId?: string;
}): string {
  const { empresa, modo, canais, analiseId } = opts;
  const lista =
    modo === "tudo" || canais.length === 0
      ? "quero resolver a presença digital completa (todos os canais do diagnóstico)"
      : `quero proposta para: ${canais.map((c) => c.label).join(", ")}`;

  const linhas = [
    `Olá! Vi a apresentação de presença da ${empresa} e ${lista}.`,
    "Podem me enviar a proposta com plano, prazo e investimento?",
  ];
  if (analiseId) linhas.push(`(ref: ${analiseId.slice(0, 8)})`);
  return linhas.join("\n");
}

export function whatsappPropostaUrl(opts: {
  empresa: string;
  modo: "marcado" | "tudo";
  canais: CanalMarcado[];
  analiseId?: string;
}): string | null {
  const phone = comercialWhatsapp();
  if (!phone) return null;
  const text = buildMensagemProposta(opts);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
