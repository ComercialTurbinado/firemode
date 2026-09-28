"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import PecaCard, { CUNHO_LABEL, type Peca } from "./PecaCard";
import PautaStatusAction from "./PautaStatusAction";
import TrilhaConteudoPanel from "./TrilhaConteudoPanel";
import type { TrilhaConteudo } from "@/lib/trilha-conteudo";
import GeracaoProgressModal, {
  type JobAtivo,
  lerJobAtivo,
  limparJobAtivo,
  salvarJobAtivo,
} from "./GeracaoProgressModal";

type Pauta = {
  id: string;
  titulo: string;
  palavra_chave: string | null;
  intencao: string | null;
  dificuldade: string | null;
  prioridade: number | null;
  lacuna: string | null;
  status: string;
  cliente_handle: string | null;
};

const TABS: { id: string; label: string }[] = [
  { id: "pauta", label: "Pauta editorial" },
  { id: "artigo", label: "Artigos" },
  { id: "video", label: "Roteiros" },
  { id: "post", label: "Posts" },
  { id: "ad", label: "Anúncios" },
];

const CUNHOS = ["explicacao", "comercial", "tendencia", "news", "funil"] as const;

function grupoKey(p: Peca): string {
  return p.artigo_ref || p.lote_id || p.palavra_chave || "_sem_origem";
}

function tituloGrupo(key: string, pecas: Peca[], artigos: Peca[]): string {
  const artigo = artigos.find((a) => a.id === key);
  if (artigo?.titulo) return artigo.titulo;
  const sample = pecas.find((p) => grupoKey(p) === key);
  if (sample?.palavra_chave) return `Keyword: ${sample.palavra_chave}`;
  if (key === "_sem_origem") return "Sem artigo vinculado";
  return "Lote sem título";
}

export default function PecasTabs({
  pecas,
  pautas,
  clienteHandle,
  analiseId,
  trilha,
}: {
  pecas: Peca[];
  pautas: Pauta[];
  clienteHandle: string | null;
  analiseId: string;
  trilha: TrilhaConteudo;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("aba");

  const counts = Object.fromEntries(
    TABS.map((t) => [
      t.id,
      t.id === "pauta" ? pautas.length : pecas.filter((p) => p.tipo === t.id).length,
    ]),
  ) as Record<string, number>;

  const primeira =
    (fromUrl && counts[fromUrl] != null ? fromUrl : null) ??
    TABS.find((t) => counts[t.id] > 0)?.id ??
    "pauta";

  const [aba, setAba] = useState(primeira);
  const [cunhoFiltro, setCunhoFiltro] = useState<string | null>(null);
  const [jobAtivo, setJobAtivo] = useState<JobAtivo | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    const salvo = lerJobAtivo(analiseId);
    if (salvo) {
      setJobAtivo(salvo);
      setModalAberto(true);
    }
  }, [analiseId]);

  useEffect(() => {
    setCunhoFiltro(null);
  }, [aba]);

  const artigos = useMemo(() => pecas.filter((p) => p.tipo === "artigo"), [pecas]);
  const doTipo = useMemo(
    () => (aba === "pauta" ? [] : pecas.filter((p) => p.tipo === aba)),
    [aba, pecas],
  );

  const filtrados = useMemo(() => {
    if (!cunhoFiltro) return doTipo;
    return doTipo.filter((p) => {
      const c = p.cunho || (typeof p.payload?.cunho === "string" ? p.payload.cunho : null);
      return c === cunhoFiltro;
    });
  }, [doTipo, cunhoFiltro]);

  const grupos = useMemo(() => {
    if (aba === "artigo" || aba === "pauta") return null;
    const map = new Map<string, Peca[]>();
    for (const p of filtrados) {
      const k = grupoKey(p);
      const arr = map.get(k) ?? [];
      arr.push(p);
      map.set(k, arr);
    }
    return [...map.entries()];
  }, [aba, filtrados]);

  const cunhoCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of doTipo) {
      const key = p.cunho || (typeof p.payload?.cunho === "string" ? p.payload.cunho : null);
      if (!key) continue;
      c[key] = (c[key] ?? 0) + 1;
    }
    return c;
  }, [doTipo]);

  function iniciarJob(pauta: Pauta, jobId: string) {
    const job: JobAtivo = {
      jobId,
      pautaId: pauta.id,
      titulo: pauta.titulo,
      analiseId,
    };
    salvarJobAtivo(job);
    setJobAtivo(job);
    setModalAberto(true);
  }

  const mostraFiltroCunho = aba === "video" || aba === "post" || aba === "ad";

  return (
    <>
      <div style={{
        background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
        borderRadius: 12, overflow: "hidden",
      }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--fm-border)", overflowX: "auto" }}>
          {TABS.map((t) => {
            const n = counts[t.id] ?? 0;
            const ativa = aba === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setAba(t.id)}
                style={{
                  flex: 1, minWidth: 110, padding: "12px 8px", background: "none", border: "none",
                  borderBottom: ativa ? "2px solid var(--fm-accent)" : "2px solid transparent",
                  color: n === 0 ? "var(--fm-border)" : ativa ? "var(--fm-accent)" : "var(--fm-muted)",
                  fontWeight: ativa ? 700 : 500, fontSize: 13,
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                {t.label}
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.75 }}>{n}</span>
              </button>
            );
          })}
        </div>

        {mostraFiltroCunho && Object.keys(cunhoCounts).length > 0 && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 6, padding: "12px 16px 0",
          }}>
            <button
              type="button"
              onClick={() => setCunhoFiltro(null)}
              style={{
                fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
                border: `1px solid ${!cunhoFiltro ? "var(--fm-accent)" : "var(--fm-border)"}`,
                background: !cunhoFiltro ? "var(--fm-accent-soft)" : "transparent",
                color: !cunhoFiltro ? "var(--fm-accent)" : "var(--fm-muted)",
                cursor: "pointer",
              }}
            >
              Todos ({doTipo.length})
            </button>
            {CUNHOS.filter((c) => cunhoCounts[c]).map((c) => {
              const ativa = cunhoFiltro === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCunhoFiltro(ativa ? null : c)}
                  style={{
                    fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
                    border: `1px solid ${ativa ? "var(--fm-accent)" : "var(--fm-border)"}`,
                    background: ativa ? "var(--fm-accent-soft)" : "transparent",
                    color: ativa ? "var(--fm-accent)" : "var(--fm-muted)",
                    cursor: "pointer",
                  }}
                >
                  {CUNHO_LABEL[c] ?? c} ({cunhoCounts[c]})
                </button>
              );
            })}
          </div>
        )}

        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {aba === "pauta" ? (
            <>
              <TrilhaConteudoPanel trilha={trilha} />
            {!pautas.length ? (
              <p style={{ color: "var(--fm-muted)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
                Nenhuma pauta editorial.
              </p>
            ) : (
              pautas.map((p) => (
                <div key={p.id} style={{ padding: "10px 14px", background: "var(--fm-inset)", borderRadius: 8, border: "1px solid var(--fm-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>
                      {p.prioridade != null ? `${p.prioridade}. ` : ""}{p.titulo}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {jobAtivo?.pautaId === p.id && !modalAberto && (
                        <button
                          type="button"
                          onClick={() => setModalAberto(true)}
                          style={{
                            fontSize: 10, fontWeight: 700, color: "var(--fm-accent)",
                            background: "none", border: "none", cursor: "pointer", padding: 0,
                          }}
                        >
                          ver progresso
                        </button>
                      )}
                      <PautaStatusAction
                        pautaId={p.id}
                        titulo={p.titulo}
                        clienteHandle={p.cliente_handle ?? clienteHandle}
                        analiseId={analiseId}
                        status={p.status}
                        gerando={jobAtivo?.pautaId === p.id}
                        trilhaPronta={trilha.pronto}
                        faltantes={trilha.faltantes}
                        onIniciado={(jobId) => iniciarJob(p, jobId)}
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 3 }}>
                    {[p.palavra_chave, p.intencao, p.dificuldade ? `dificuldade ${p.dificuldade}` : null, p.lacuna ? `lacuna: ${p.lacuna}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              ))
            )}
            </>
          ) : !filtrados.length ? (
            <p style={{ color: "var(--fm-muted)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
              Nenhuma peça deste tipo{cunhoFiltro ? ` com cunho “${CUNHO_LABEL[cunhoFiltro] ?? cunhoFiltro}”` : ""}.
            </p>
          ) : aba === "artigo" ? (
            filtrados.map((p) => <PecaCard key={p.id} peca={p} />)
          ) : (
            grupos?.map(([key, itens]) => (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{
                  display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12,
                  padding: "4px 2px",
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Artigo · {tituloGrupo(key, itens, artigos)}
                  </p>
                  <span style={{ fontSize: 11, color: "var(--fm-muted)" }}>{itens.length} peça(s)</span>
                </div>
                {itens.map((p) => <PecaCard key={p.id} peca={p} />)}
              </div>
            ))
          )}
        </div>
      </div>

      {modalAberto && jobAtivo && (
        <GeracaoProgressModal
          jobAtivo={jobAtivo}
          onClose={() => setModalAberto(false)}
          onDone={() => {
            setModalAberto(false);
            setJobAtivo(null);
            limparJobAtivo();
            router.refresh();
          }}
        />
      )}
    </>
  );
}
