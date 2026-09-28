"use client";

import { TermoLabel } from "./TermoHint";
import { fetchConteudoJson } from "@/lib/fetch-conteudo-json";
import { asDisplayText } from "@/lib/text-field";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/AdminForm";

export type PersonaDemografia = {
  faixa_etaria?: string | null;
  genero_predominante?: string | null;
  localizacao?: string | null;
  renda_proxy?: string | null;
  ocupacao_papel?: string | null;
  escolaridade_proxy?: string | null;
  estado_civil_familia?: string | null;
};

export type PersonaIdeal = {
  id?: string;
  nome_persona?: string;
  prioridade?: number;
  demografia?: PersonaDemografia;
  por_que_ideal?: string | null;
  motivacoes_compra?: string[];
  dores?: string[];
  objecoes?: string[];
  interesses_no_assunto?: string[];
  o_que_atrai?: string[];
  o_que_converte?: string[];
  como_falar?: {
    tom?: string | null;
    vocabulario?: string[];
    evitar_dizer?: string[];
    exemplo_mensagem?: string | null;
  };
  canais?: string[];
  jornada?: string | null;
  ticket_mental?: string | null;
  gatilhos_conteudo?: string[];
  perguntas_que_fazem?: string[];
  confianca?: string | null;
};

export type PersonaEvitar = {
  id?: string;
  nome_persona?: string;
  prioridade?: number;
  demografia?: PersonaDemografia;
  porque_evitar?: string | null;
  sinais?: string[];
  o_que_atrai_erroneamente?: string[];
  como_filtrar?: string | null;
  risco_se_focar_nele?: string | null;
  confianca?: string | null;
};

export type AudienciaIdealData = {
  atualizado_em?: string;
  erro?: string | null;
  fonte?: string | null;
  refine_erro?: string | null;
  resumo?: string | null;
  tipo_negocio?: string | null;
  icp_declarado?: string | null;
  icp_real_inferido?: string | null;
  gap_declarado_vs_real?: string | null;
  evidencias_usadas?: string[];
  ideais?: PersonaIdeal[];
  evitar?: PersonaEvitar[];
  implicacoes_conteudo?: {
    pilares_priorizar?: string[];
    pilares_cortar_ou_reduzir?: string[];
    formatos?: string[];
    ctas_recomendados?: string[];
    tom_geral?: string | null;
  };
  oportunidades_rapidas?: {
    titulo?: string;
    onde?: string;
    como?: string;
    persona_alvo?: string;
    impacto?: string;
  }[];
  notas_refino?: string[];
  serp?: {
    ok?: boolean;
    fonte?: string;
    queries?: { q?: string; related?: string[] }[];
    snippets?: { query?: string; titulo?: string; snippet?: string }[];
  };
  fit_conteudo?: unknown;
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <p
    style={{
      fontWeight: 600,
      fontSize: 11,
      color: "var(--fm-muted)",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      marginBottom: 6,
    }}
  >
    {children}
  </p>
);

const box: React.CSSProperties = {
  padding: "12px 14px",
  background: "var(--fm-inset)",
  borderRadius: 8,
  border: "1px solid var(--fm-border)",
};

function asStringList(items?: unknown): string[] {
  if (items == null) return [];
  if (Array.isArray(items)) {
    return items
      .map((t) => (typeof t === "string" ? t : asDisplayText(t) || (t != null ? String(t) : "")))
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (typeof items === "string") {
    const t = items.trim();
    return t ? [t] : [];
  }
  return [];
}

function Bullets({ items, empty = "—" }: { items?: unknown; empty?: string }) {
  const list = asStringList(items);
  if (!list.length) return <span style={{ color: "var(--fm-muted)", fontSize: 13 }}>{empty}</span>;
  return (
    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.45 }}>
      {list.map((t, i) => (
        <li key={`${i}-${t.slice(0, 40)}`}>{t}</li>
      ))}
    </ul>
  );
}

function DemoLine({ d }: { d?: PersonaDemografia }) {
  if (!d) return null;
  const parts = [
    d.faixa_etaria,
    d.genero_predominante,
    d.localizacao,
    d.ocupacao_papel,
    d.renda_proxy,
  ].filter(Boolean);
  if (!parts.length) return null;
  return (
    <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4 }}>{parts.join(" · ")}</p>
  );
}

export default function AudienciaPanel({
  analiseId,
  initial,
}: {
  analiseId: string;
  initial: AudienciaIdealData | null | undefined;
}) {
  const router = useRouter();
  const [data, setData] = useState<AudienciaIdealData | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function atualizar() {
    setLoading(true);
    setErro(null);
    try {
      const json = await fetchConteudoJson<{ audiencia_ideal?: AudienciaIdealData }>(
        "/api/conteudo/audiencia/atualizar",
        {
          method: "POST",
          body: JSON.stringify({ analise_web_id: analiseId }),
        },
      );
      setData(json.audiencia_ideal ?? null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const tem = !!data && ((data.ideais?.length ?? 0) > 0 || !!data.resumo || !!data.erro);
  const imp = data?.implicacoes_conteudo;

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 14,
        }}
      >
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 14 }}>
            <TermoLabel glossKey="audiencia">Audiência ideal</TermoLabel>
            {" · quem compra e quem evitar"}
          </h2>
          <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 4 }}>
            GPT + DeepSeek + Google (SERP): 3 perfis ideais e 3 a evitar — demografia, motivação,
            como falar e o que converte. Fit do conteúdo atual vem na próxima fase.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void atualizar()}
          disabled={loading}
          style={{
            flexShrink: 0,
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid var(--fm-border)",
            background: loading ? "var(--fm-inset)" : "var(--fm-orange, #ea580c)",
            color: loading ? "var(--fm-muted)" : "#fff",
            fontWeight: 600,
            fontSize: 13,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Pesquisando…" : tem ? "Atualizar" : "Gerar audiência"}
        </button>
      </div>

      {erro ? (
        <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: 12 }}>{erro}</p>
      ) : null}
      {data?.erro ? (
        <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: 12 }}>{data.erro}</p>
      ) : null}
      {data?.refine_erro ? (
        <p style={{ color: "var(--fm-muted)", fontSize: 12, marginBottom: 10 }}>
          Refino DeepSeek falhou (mantido rascunho GPT): {data.refine_erro}
        </p>
      ) : null}

      {!tem && !loading ? (
        <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>
          Rode depois do diagnóstico do site (e IG se tiver) pra cruzar evidências reais.
        </p>
      ) : null}

      {data?.resumo ? (
        <div style={{ ...box, marginBottom: 14 }}>
          <Label>Resumo</Label>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>{data.resumo}</p>
          {data.tipo_negocio ? (
            <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 8 }}>
              Tipo: {data.tipo_negocio}
              {data.fonte ? ` · fonte: ${data.fonte}` : ""}
            </p>
          ) : null}
        </div>
      ) : null}

      {(data?.icp_declarado || data?.icp_real_inferido || data?.gap_declarado_vs_real) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10,
            marginBottom: 14,
          }}
        >
          {data.icp_declarado ? (
            <div style={box}>
              <Label>ICP declarado</Label>
              <p style={{ fontSize: 13, margin: 0 }}>{data.icp_declarado}</p>
            </div>
          ) : null}
          {data.icp_real_inferido ? (
            <div style={box}>
              <Label>ICP real (inferido)</Label>
              <p style={{ fontSize: 13, margin: 0 }}>{data.icp_real_inferido}</p>
            </div>
          ) : null}
          {data.gap_declarado_vs_real ? (
            <div style={{ ...box, borderColor: "rgba(234, 88, 12, 0.35)" }}>
              <Label>Gap discurso × realidade</Label>
              <p style={{ fontSize: 13, margin: 0 }}>{data.gap_declarado_vs_real}</p>
            </div>
          ) : null}
        </div>
      )}

      {Array.isArray(data?.ideais) && data.ideais.length > 0 ? (
        <div style={{ marginBottom: 18 }}>
          <Label>Perfis ideais</Label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 10,
            }}
          >
            {data.ideais.map((p, i) => (
              <div key={p.id || p.nome_persona || i} style={box}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>
                  {i + 1}. {p.nome_persona || "Persona"}
                  {p.confianca ? (
                    <span style={{ fontWeight: 500, color: "var(--fm-muted)", fontSize: 11 }}>
                      {" "}
                      · {p.confianca}
                    </span>
                  ) : null}
                </p>
                <DemoLine d={p.demografia} />
                {p.por_que_ideal ? (
                  <p style={{ fontSize: 13, marginTop: 8 }}>{p.por_que_ideal}</p>
                ) : null}
                <div style={{ marginTop: 10 }}>
                  <Label>Motiva comprar</Label>
                  <Bullets items={p.motivacoes_compra} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <Label>O que atrai</Label>
                  <Bullets items={p.o_que_atrai} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <Label>O que converte</Label>
                  <Bullets items={p.o_que_converte} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <Label>Interesses</Label>
                  <Bullets items={p.interesses_no_assunto} />
                </div>
                {p.como_falar ? (
                  <div style={{ marginTop: 8 }}>
                    <Label>Como falar</Label>
                    <p style={{ fontSize: 13, margin: "0 0 4px" }}>
                      Tom: {asDisplayText(p.como_falar.tom) || "—"}
                    </p>
                    {asDisplayText(p.como_falar.exemplo_mensagem) ? (
                      <p
                        style={{
                          fontSize: 13,
                          fontStyle: "italic",
                          margin: 0,
                          color: "var(--fm-fg)",
                        }}
                      >
                        “{asDisplayText(p.como_falar.exemplo_mensagem)}”
                      </p>
                    ) : null}
                    <Bullets items={p.como_falar.vocabulario} empty="" />
                  </div>
                ) : null}
                {asStringList(p.gatilhos_conteudo).length ? (
                  <div style={{ marginTop: 8 }}>
                    <Label>Gatilhos de conteúdo</Label>
                    <Bullets items={p.gatilhos_conteudo} />
                  </div>
                ) : null}
                {asStringList(p.perguntas_que_fazem).length ? (
                  <div style={{ marginTop: 8 }}>
                    <Label>Perguntas que fazem</Label>
                    <Bullets items={p.perguntas_que_fazem} />
                  </div>
                ) : null}
                {p.canais?.length ? (
                  <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 8 }}>
                    Canais: {p.canais.join(", ")}
                    {p.jornada ? ` · jornada: ${p.jornada}` : ""}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {Array.isArray(data?.evitar) && data.evitar.length > 0 ? (
        <div style={{ marginBottom: 18 }}>
          <Label>Perfis a evitar</Label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 10,
            }}
          >
            {data.evitar.map((p, i) => (
              <div
                key={p.id || p.nome_persona || i}
                style={{ ...box, borderColor: "rgba(185, 28, 28, 0.25)" }}
              >
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>
                  {i + 1}. {p.nome_persona || "Evitar"}
                </p>
                <DemoLine d={p.demografia} />
                {p.porque_evitar ? (
                  <p style={{ fontSize: 13, marginTop: 8 }}>{p.porque_evitar}</p>
                ) : null}
                <div style={{ marginTop: 8 }}>
                  <Label>Sinais</Label>
                  <Bullets items={p.sinais} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <Label>Conteúdo que atrai sem querer</Label>
                  <Bullets items={p.o_que_atrai_erroneamente} />
                </div>
                {p.como_filtrar ? (
                  <p style={{ fontSize: 13, marginTop: 8 }}>
                    <strong>Filtrar:</strong> {p.como_filtrar}
                  </p>
                ) : null}
                {p.risco_se_focar_nele ? (
                  <p style={{ fontSize: 12, color: "#b91c1c", marginTop: 6 }}>
                    Risco: {p.risco_se_focar_nele}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {imp &&
      (imp.pilares_priorizar?.length ||
        imp.pilares_cortar_ou_reduzir?.length ||
        imp.tom_geral) ? (
        <div style={{ ...box, marginBottom: 14 }}>
          <Label>Implicações de conteúdo</Label>
          {imp.tom_geral ? (
            <p style={{ fontSize: 13, margin: "0 0 8px" }}>{imp.tom_geral}</p>
          ) : null}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
            }}
          >
            <div>
              <Label>Priorizar</Label>
              <Bullets items={imp.pilares_priorizar} />
            </div>
            <div>
              <Label>Cortar / reduzir</Label>
              <Bullets items={imp.pilares_cortar_ou_reduzir} />
            </div>
            <div>
              <Label>Formatos</Label>
              <Bullets items={imp.formatos} />
            </div>
            <div>
              <Label>CTAs</Label>
              <Bullets items={imp.ctas_recomendados} />
            </div>
          </div>
        </div>
      ) : null}

      {data?.oportunidades_rapidas && data.oportunidades_rapidas.length > 0 ? (
        <div style={{ marginBottom: 10 }}>
          <Label>Oportunidades rápidas</Label>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
            {data.oportunidades_rapidas.map((o, i) => (
              <li key={o.titulo || i} style={{ marginBottom: 6 }}>
                <strong>{o.titulo}</strong>
                {o.onde ? ` (${o.onde})` : ""}
                {o.como ? ` — ${o.como}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {data?.atualizado_em ? (
        <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 8 }}>
          Atualizado: {new Date(data.atualizado_em).toLocaleString("pt-BR")}
          {data.fit_conteudo == null
            ? " · Fit do conteúdo: pendente (fase 2)"
            : ""}
        </p>
      ) : null}
    </Card>
  );
}
