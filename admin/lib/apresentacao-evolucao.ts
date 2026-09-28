/** Evolução do scorecard (última verificação + janelas 7/15/30d) para a LP. */

import type { ScorecardDelta, ScorecardSnapshot } from "./presenca-scorecard-delta";
import { labelCanalScore } from "./presenca-scorecard-delta";

export type EvolucaoJanela = {
  dias: 7 | 15 | 30;
  label: string;
  geral_antes: number | null;
  geral_depois: number | null;
  geral_delta: number | null;
  em_antes: string | null;
};

export type EvolucaoLP = {
  /** Delta vs última foto (pipeline / cron). */
  recente: ScorecardDelta | null;
  /** Deltas aproximados vs ~7 / ~15 / ~30 dias atrás. */
  janelas: EvolucaoJanela[];
  /** Linha do tempo de nota geral (mais antiga → mais nova). */
  timeline: { em: string; geral: number }[];
  fotos: number;
};

const MS_DIA = 24 * 60 * 60 * 1000;

function parseEm(em?: string | null): number | null {
  if (!em) return null;
  const t = Date.parse(em);
  return Number.isFinite(t) ? t : null;
}

function sortHist(hist: ScorecardSnapshot[]): ScorecardSnapshot[] {
  return [...hist].sort((a, b) => (parseEm(a.em) ?? 0) - (parseEm(b.em) ?? 0));
}

function deltaUtil(d: ScorecardDelta | null | undefined): boolean {
  if (!d) return false;
  if (d.geral_delta != null) return true;
  return Boolean(
    d.melhorou?.length
    || d.piorou?.length
    || d.novo?.length
    || d.sumiu?.length,
  );
}

/** Diff leve entre duas fotos (espelha content-machine/scorecard_snapshot.diff_snapshots). */
export function diffSnapshots(
  antes: ScorecardSnapshot | null | undefined,
  depois: ScorecardSnapshot | null | undefined,
): ScorecardDelta {
  const ca = (antes?.canais && typeof antes.canais === "object") ? antes.canais : {};
  const cb = (depois?.canais && typeof depois.canais === "object") ? depois.canais : {};
  const ids = Array.from(new Set([...Object.keys(ca), ...Object.keys(cb)])).sort();

  const melhorou: ScorecardDelta["melhorou"] = [];
  const piorou: ScorecardDelta["piorou"] = [];
  const igual: ScorecardDelta["igual"] = [];
  const novo: ScorecardDelta["novo"] = [];
  const sumiu: ScorecardDelta["sumiu"] = [];

  for (const id of ids) {
    const va = ca[id];
    const vb = cb[id];
    if (va == null && vb != null) {
      novo!.push({ id, depois: vb });
    } else if (va != null && vb == null) {
      sumiu!.push({ id, antes: va });
    } else if (va != null && vb != null) {
      const delta = Math.round(vb) - Math.round(va);
      const row = { id, antes: va, depois: vb, delta };
      if (delta > 0) melhorou!.push(row);
      else if (delta < 0) piorou!.push(row);
      else igual!.push(row);
    }
  }

  const ga = antes?.geral ?? null;
  const gb = depois?.geral ?? null;
  let geral_delta: number | null = null;
  if (ga != null && gb != null) geral_delta = Math.round(gb) - Math.round(ga);

  return {
    em: depois?.em || new Date().toISOString(),
    geral_antes: ga,
    geral_depois: gb,
    geral_delta,
    melhorou,
    piorou,
    igual,
    novo,
    sumiu,
    resumo: {
      melhorou: melhorou!.length,
      piorou: piorou!.length,
      igual: igual!.length,
      novo: novo!.length,
      sumiu: sumiu!.length,
    },
  };
}

function snapMaisProximoDe(
  hist: ScorecardSnapshot[],
  alvoMs: number,
  toleranciaMs: number,
  excluirEm?: string | null,
): ScorecardSnapshot | null {
  let best: ScorecardSnapshot | null = null;
  let bestDist = Infinity;
  for (const s of hist) {
    if (excluirEm && s.em === excluirEm) continue;
    const t = parseEm(s.em);
    if (t == null || s.geral == null) continue;
    const dist = Math.abs(t - alvoMs);
    if (dist < bestDist) {
      bestDist = dist;
      best = s;
    }
  }
  if (best && bestDist <= toleranciaMs) return best;
  return null;
}

const JANELAS: { dias: 7 | 15 | 30; label: string; toleranciaDias: number }[] = [
  { dias: 7, label: "7 dias", toleranciaDias: 4 },
  { dias: 15, label: "15 dias", toleranciaDias: 6 },
  { dias: 30, label: "30 dias", toleranciaDias: 10 },
];

export function extrairEvolucao(opts: {
  delta?: ScorecardDelta | null;
  historico?: ScorecardSnapshot[] | null;
  /** Snapshot “agora” se o histórico ainda não tiver a foto atual. */
  atual?: ScorecardSnapshot | null;
}): EvolucaoLP | null {
  const hist = sortHist(
    Array.isArray(opts.historico)
      ? opts.historico.filter((h) => h && (h.geral != null || (h.canais && Object.keys(h.canais).length)))
      : [],
  );

  const atual =
    opts.atual?.geral != null
      ? opts.atual
      : hist.length
        ? hist[hist.length - 1]
        : null;

  const recenteRaw =
    (deltaUtil(opts.delta) ? opts.delta : null)
    ?? (hist.length >= 2
      ? diffSnapshots(hist[hist.length - 2], hist[hist.length - 1])
      : null)
    ?? (atual && hist.length >= 1 && hist[hist.length - 1] !== atual
      ? diffSnapshots(hist[hist.length - 1], atual)
      : null);

  const recente = deltaUtil(recenteRaw) ? recenteRaw! : null;

  const agora = parseEm(atual?.em) ?? Date.now();
  const janelas: EvolucaoJanela[] = [];

  if (atual?.geral != null && hist.length) {
    for (const j of JANELAS) {
      const alvo = agora - j.dias * MS_DIA;
      const base = snapMaisProximoDe(
        hist,
        alvo,
        j.toleranciaDias * MS_DIA,
        atual.em,
      );
      if (!base || base.geral == null) continue;
      // Evita “janela” que é a própria foto atual ou quase idêntica no tempo
      const tBase = parseEm(base.em);
      if (tBase != null && Math.abs(agora - tBase) < 2 * MS_DIA) continue;

      const d = Math.round(atual.geral) - Math.round(base.geral);
      janelas.push({
        dias: j.dias,
        label: j.label,
        geral_antes: Math.round(base.geral),
        geral_depois: Math.round(atual.geral),
        geral_delta: d,
        em_antes: base.em ?? null,
      });
    }
  }

  const timeline = hist
    .filter((h): h is ScorecardSnapshot & { em: string; geral: number } =>
      Boolean(h.em && h.geral != null),
    )
    .map((h) => ({ em: h.em, geral: Math.round(h.geral) }));

  // Inclui atual se for mais novo que o último do hist
  if (atual?.em && atual.geral != null) {
    const last = timeline[timeline.length - 1];
    if (!last || last.em !== atual.em) {
      timeline.push({ em: atual.em, geral: Math.round(atual.geral) });
    }
  }

  if (!recente && !janelas.length && timeline.length < 2) return null;

  return {
    recente,
    janelas,
    timeline,
    fotos: Math.max(hist.length, timeline.length),
  };
}

export function fmtDelta(d: number | null | undefined): string {
  if (d == null) return "—";
  if (d > 0) return `+${d}`;
  return String(d);
}

export function corDelta(d: number | null | undefined): string {
  if (d == null || d === 0) return "var(--fm-muted)";
  if (d > 0) return "var(--fm-green)";
  return "var(--fm-red)";
}

export { labelCanalScore };
