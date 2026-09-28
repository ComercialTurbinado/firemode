/** Frase-tese âncora para o topo da apresentação (capa). */

type MovimentoLite = {
  ordem?: number;
  titulo?: string;
  gap?: string;
  canal?: string;
  acao_principal?: string;
};

function primeiraFrases(texto: string, maxChars = 220): string {
  const t = texto.replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= maxChars) return t;

  // Corta no fim de frase dentro do limite
  const slice = t.slice(0, maxChars);
  const m = slice.match(/^(.*?[.!?])(?:\s|$)/);
  if (m && m[1].length >= 60) return m[1].trim();

  const corte = slice.lastIndexOf(" ");
  return `${(corte > 40 ? slice.slice(0, corte) : slice).trim()}…`;
}

/**
 * Prioridade: tese do plano → gancho comercial → situação executiva → síntese de fallback.
 * Retorna null se não houver âncora útil (capa fica só com nome da empresa).
 */
export function extrairTeseTopo(opts: {
  tese?: string | null;
  gancho?: string | null;
  situacao?: string | null;
  movimentos?: MovimentoLite[] | null;
  concorrenteTopo?: string | null;
  criticos?: string[] | null;
}): string | null {
  const tese = opts.tese?.trim();
  if (tese && tese.length >= 24) return primeiraFrases(tese);

  const gancho = opts.gancho?.trim();
  if (gancho && gancho.length >= 20) return primeiraFrases(gancho);

  const situacao = opts.situacao?.trim();
  if (situacao && situacao.length >= 20) return primeiraFrases(situacao);

  const movs = [...(opts.movimentos || [])].sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99));
  const m0 = movs[0];
  const critico = (opts.criticos || []).filter(Boolean)[0];
  const rival = opts.concorrenteTopo?.trim();

  const bits: string[] = [];
  if (critico) {
    bits.push(`Vocês somem ou travam em ${critico}`);
  } else if (m0?.gap?.trim()) {
    bits.push(m0.gap.trim().replace(/\.$/, ""));
  } else if (m0?.titulo?.trim()) {
    bits.push(m0.titulo.trim().replace(/\.$/, ""));
  }

  if (rival) {
    bits.push(`enquanto ${rival} ocupa o espaço na disputa`);
  } else if (m0?.acao_principal?.trim() && bits.length) {
    bits.push(`o desbloqueio começa por: ${m0.acao_principal.trim().replace(/\.$/, "")}`);
  }

  if (!bits.length) return null;
  let out = bits.join(" — ");
  if (!/[.!?]$/.test(out)) out += ".";
  return primeiraFrases(out, 200);
}
