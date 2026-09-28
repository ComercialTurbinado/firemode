import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Card } from "@/components/AdminForm";

export const dynamic = "force-dynamic";

function fmt(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontWeight: 700, fontSize: 12, color: "var(--fm-muted)", marginBottom: 10,
      textTransform: "uppercase", letterSpacing: "0.06em",
    }}>
      {children}
    </p>
  );
}

function TagList({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((t, i) => (
        <span key={i} style={{
          fontSize: 12, padding: "4px 10px", borderRadius: 20,
          background: "var(--fm-accent-soft)", color: "var(--fm-accent)", fontWeight: 500,
        }}>
          {t}
        </span>
      ))}
    </div>
  );
}

function NumList({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <ol style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 18, fontSize: 13, lineHeight: 1.5 }}>
      {items.map((t, i) => <li key={i}>{t}</li>)}
    </ol>
  );
}

type CaminhoCrescimento = {
  titulo?: string; movimento?: string; porque_funciona?: string;
  impacto_em_vendas?: string; tempo_para_resultado?: string;
};

type ComparativoConcorrente = {
  handle?: string; estrategia_que_funciona?: string; como_voce_aplica?: string; ganho_esperado_vendas?: string;
};

type PilarConteudo = { pilar?: string; descricao?: string; porcentagem?: number; exemplo_concorrente?: string };

type KpiRow = { kpi?: string; baseline?: string; meta_30d?: string; meta_60d?: string; meta_90d?: string; como_medir?: string };

type DiaCalendario = {
  dia?: number; dia_semana?: string; tema?: string; pilar?: string; formato?: string;
  objetivo?: string; gancho_3s?: string; cta?: string; legenda_completa?: string;
};

export default async function PlanoDiretorPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();

  const [{ data: cliente }, { data: planos }] = await Promise.all([
    supabase.from("clientes").select("handle, nome_completo").eq("handle", handle).maybeSingle(),
    supabase
      .from("planos_diretores")
      .select("*")
      .eq("cliente_handle", handle)
      .order("criado_em", { ascending: false })
      .limit(1),
  ]);

  if (!cliente) notFound();
  const plano = planos?.[0] ?? null;

  const tomDeVoz = (plano?.tom_de_voz ?? {}) as {
    personalidade?: string; como_falar?: string[]; como_nao_falar?: string[];
    exemplos_frase_ok?: string[]; exemplos_frase_evitar?: string[];
  };
  const seo = (plano?.seo_instagram ?? {}) as {
    bio_otimizada?: string; hashtags_fixas?: string[]; uso_em_legenda?: string;
    palavras_chave_principais?: string[]; palavras_chave_secundarias?: string[];
  };
  const freq = (plano?.frequencia_publicacao ?? {}) as {
    dias_de_pico?: string[]; posts_por_dia?: number; posts_por_semana?: number;
    melhor_horario?: string; melhores_horarios?: string[];
    distribuicao_formatos?: { foto_pct?: number; reels_pct?: number; carrossel_pct?: number };
  };
  const pilares = (plano?.pilares_conteudo ?? []) as PilarConteudo[];
  const hashtags = (plano?.hashtags_estrategicas ?? {}) as {
    core?: string[]; evite?: string[]; rotativas_nicho?: string[]; rotativas_alto_volume?: string[];
  };
  const visual = (plano?.identidade_visual ?? {}) as {
    tipografia?: { texto?: string; display?: string; regras_uso?: string[] };
    paleta_cores?: { hex?: string; nome?: string; uso?: string }[];
    estilo_grafico?: string; estilo_fotografico?: string;
    vestimenta_aparicoes?: { diretrizes?: string; evitar?: string[]; mood_referencias?: string[] };
  };
  const stories = (plano?.stories_recorrentes ?? []) as { tipo?: string; descricao?: string; frequencia?: string }[];
  const kpis = (plano?.kpis_acompanhar ?? []) as KpiRow[];
  const caminhos = (plano?.caminhos_crescimento ?? []) as CaminhoCrescimento[];
  const comparativo = (plano?.comparativo_concorrentes ?? []) as ComparativoConcorrente[];
  const calendario = (plano?.calendario_30_dias ?? []) as DiaCalendario[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 860 }}>
      <div>
        <Link href={`/fireadmin/clientes/${handle}`} style={{ color: "var(--fm-muted)", fontSize: 13, textDecoration: "none" }}>
          ← {cliente.nome_completo ?? cliente.handle}
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 8 }}>
          Plano Diretor — Instagram
        </h1>
        <p style={{ color: "var(--fm-muted)", marginTop: 4, fontSize: 13 }}>
          @{cliente.handle}{plano ? ` · gerado em ${fmt(plano.criado_em)}` : ""}
        </p>
      </div>

      {!plano ? (
        <Card>
          <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>
            Nenhum plano diretor gerado ainda para este cliente.
          </p>
        </Card>
      ) : (
        <>
          {(plano.diagnostico_identidade || plano.posicionamento_atual) && (
            <Card>
              {plano.diagnostico_identidade && (
                <div style={{ marginBottom: plano.posicionamento_atual ? 20 : 0 }}>
                  <SectionTitle>Diagnóstico de identidade</SectionTitle>
                  <p style={{ fontSize: 13, lineHeight: 1.6 }}>{plano.diagnostico_identidade}</p>
                </div>
              )}
              {plano.posicionamento_atual && (
                <div>
                  <SectionTitle>Posicionamento atual</SectionTitle>
                  <p style={{ fontSize: 13, lineHeight: 1.6 }}>{plano.posicionamento_atual}</p>
                </div>
              )}
            </Card>
          )}

          {(plano.pontos_fortes?.length || plano.pontos_fracos?.length) && (
            <Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {plano.pontos_fortes?.length ? (
                  <div>
                    <SectionTitle>Pontos fortes</SectionTitle>
                    <ul style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 16, fontSize: 13, lineHeight: 1.5, color: "var(--fm-green)" }}>
                      {(plano.pontos_fortes as string[]).map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                ) : <div />}
                {plano.pontos_fracos?.length ? (
                  <div>
                    <SectionTitle>Pontos fracos</SectionTitle>
                    <ul style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 16, fontSize: 13, lineHeight: 1.5, color: "var(--fm-red)" }}>
                      {(plano.pontos_fracos as string[]).map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                ) : <div />}
              </div>
            </Card>
          )}

          {plano.carta_para_cliente && (
            <Card>
              <SectionTitle>Carta para o cliente</SectionTitle>
              <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{plano.carta_para_cliente}</p>
            </Card>
          )}

          {(plano.previsao_30_dias || plano.previsao_60_dias || plano.previsao_90_dias) && (
            <Card>
              <SectionTitle>Previsões</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                {[
                  { label: "30 dias", v: plano.previsao_30_dias },
                  { label: "60 dias", v: plano.previsao_60_dias },
                  { label: "90 dias", v: plano.previsao_90_dias },
                ].filter((x) => x.v).map((x) => (
                  <div key={x.label} style={{ background: "var(--fm-inset)", borderRadius: 8, padding: 12 }}>
                    <p style={{ fontSize: 11, color: "var(--fm-muted)", marginBottom: 4 }}>{x.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{x.v}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {caminhos.length > 0 && (
            <Card>
              <SectionTitle>Caminhos de crescimento</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {caminhos.map((c, i) => (
                  <div key={i} style={{ background: "var(--fm-inset)", borderRadius: 8, padding: 14 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{c.titulo}</p>
                    {c.movimento && <p style={{ fontSize: 12, marginBottom: 4 }}><strong>Movimento:</strong> {c.movimento}</p>}
                    {c.porque_funciona && <p style={{ fontSize: 12, marginBottom: 4, color: "var(--fm-muted)" }}><strong>Por quê:</strong> {c.porque_funciona}</p>}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      {c.impacto_em_vendas && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "rgba(34,197,94,0.12)", color: "var(--fm-green)" }}>
                          {c.impacto_em_vendas}
                        </span>
                      )}
                      {c.tempo_para_resultado && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "var(--fm-hover)", color: "var(--fm-muted)" }}>
                          {c.tempo_para_resultado}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {comparativo.length > 0 && (
            <Card>
              <SectionTitle>Comparativo com concorrentes</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {comparativo.map((c, i) => (
                  <div key={i} style={{ background: "var(--fm-inset)", borderRadius: 8, padding: 14 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{c.handle}</p>
                    {c.estrategia_que_funciona && <p style={{ fontSize: 12, marginBottom: 4 }}><strong>Estratégia:</strong> {c.estrategia_que_funciona}</p>}
                    {c.como_voce_aplica && <p style={{ fontSize: 12, marginBottom: 4, color: "var(--fm-muted)" }}><strong>Como aplicar:</strong> {c.como_voce_aplica}</p>}
                    {c.ganho_esperado_vendas && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "rgba(34,197,94,0.12)", color: "var(--fm-green)", display: "inline-block", marginTop: 6 }}>
                        {c.ganho_esperado_vendas}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(tomDeVoz.personalidade || tomDeVoz.como_falar?.length) && (
            <Card>
              <SectionTitle>Tom de voz</SectionTitle>
              {tomDeVoz.personalidade && <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{tomDeVoz.personalidade}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {tomDeVoz.como_falar?.length ? (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--fm-green)", marginBottom: 6 }}>COMO FALAR</p>
                    <NumList items={tomDeVoz.como_falar} />
                  </div>
                ) : null}
                {tomDeVoz.como_nao_falar?.length ? (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--fm-red)", marginBottom: 6 }}>EVITAR</p>
                    <NumList items={tomDeVoz.como_nao_falar} />
                  </div>
                ) : null}
              </div>
            </Card>
          )}

          {(seo.bio_otimizada || seo.hashtags_fixas?.length) && (
            <Card>
              <SectionTitle>SEO Instagram</SectionTitle>
              {seo.bio_otimizada && (
                <div style={{ background: "var(--fm-inset)", borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 13 }}>
                  {seo.bio_otimizada}
                </div>
              )}
              {seo.palavras_chave_principais?.length ? (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)", marginBottom: 6 }}>PALAVRAS-CHAVE PRINCIPAIS</p>
                  <TagList items={seo.palavras_chave_principais} />
                </div>
              ) : null}
              {seo.hashtags_fixas?.length ? (
                <div>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)", marginBottom: 6 }}>HASHTAGS FIXAS</p>
                  <TagList items={seo.hashtags_fixas} />
                </div>
              ) : null}
            </Card>
          )}

          {(freq.dias_de_pico?.length || freq.melhor_horario) && (
            <Card>
              <SectionTitle>Frequência de publicação</SectionTitle>
              <div style={{ display: "flex", gap: 24, marginBottom: 14, flexWrap: "wrap" }}>
                {freq.posts_por_semana != null && (
                  <div><p style={{ fontSize: 20, fontWeight: 800 }}>{freq.posts_por_semana}</p><p style={{ fontSize: 11, color: "var(--fm-muted)" }}>posts/semana</p></div>
                )}
                {freq.melhor_horario && (
                  <div><p style={{ fontSize: 20, fontWeight: 800 }}>{freq.melhor_horario}</p><p style={{ fontSize: 11, color: "var(--fm-muted)" }}>melhor horário</p></div>
                )}
                {freq.distribuicao_formatos && (
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>
                      {freq.distribuicao_formatos.reels_pct ?? 0}% reels · {freq.distribuicao_formatos.carrossel_pct ?? 0}% carrossel · {freq.distribuicao_formatos.foto_pct ?? 0}% foto
                    </p>
                    <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>distribuição de formatos</p>
                  </div>
                )}
              </div>
              {freq.dias_de_pico?.length ? <TagList items={freq.dias_de_pico} /> : null}
            </Card>
          )}

          {pilares.length > 0 && (
            <Card>
              <SectionTitle>Pilares de conteúdo</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pilares.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{
                      fontSize: 13, fontWeight: 800, color: "var(--fm-accent)", minWidth: 40,
                    }}>
                      {p.porcentagem != null ? `${p.porcentagem}%` : ""}
                    </span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{p.pilar}</p>
                      {p.descricao && <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 2 }}>{p.descricao}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(plano.assuntos_quentes?.length || plano.ideias_titulos?.length || plano.ganchos_modelo?.length || plano.ctas_recomendados?.length) && (
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {plano.assuntos_quentes?.length ? (
                  <div>
                    <SectionTitle>Assuntos quentes</SectionTitle>
                    <NumList items={plano.assuntos_quentes as string[]} />
                  </div>
                ) : null}
                {plano.ideias_titulos?.length ? (
                  <div>
                    <SectionTitle>Ideias de títulos</SectionTitle>
                    <NumList items={plano.ideias_titulos as string[]} />
                  </div>
                ) : null}
                {plano.ganchos_modelo?.length ? (
                  <div>
                    <SectionTitle>Ganchos modelo</SectionTitle>
                    <NumList items={plano.ganchos_modelo as string[]} />
                  </div>
                ) : null}
                {plano.ctas_recomendados?.length ? (
                  <div>
                    <SectionTitle>CTAs recomendados</SectionTitle>
                    <NumList items={plano.ctas_recomendados as string[]} />
                  </div>
                ) : null}
              </div>
            </Card>
          )}

          {(hashtags.core?.length || hashtags.rotativas_nicho?.length) && (
            <Card>
              <SectionTitle>Hashtags estratégicas</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {hashtags.core?.length ? (
                  <div>
                    <p style={{ fontSize: 11, color: "var(--fm-muted)", marginBottom: 6 }}>CORE</p>
                    <TagList items={hashtags.core} />
                  </div>
                ) : null}
                {hashtags.rotativas_nicho?.length ? (
                  <div>
                    <p style={{ fontSize: 11, color: "var(--fm-muted)", marginBottom: 6 }}>ROTATIVAS DE NICHO</p>
                    <TagList items={hashtags.rotativas_nicho} />
                  </div>
                ) : null}
                {hashtags.rotativas_alto_volume?.length ? (
                  <div>
                    <p style={{ fontSize: 11, color: "var(--fm-muted)", marginBottom: 6 }}>ALTO VOLUME</p>
                    <TagList items={hashtags.rotativas_alto_volume} />
                  </div>
                ) : null}
                {hashtags.evite?.length ? (
                  <div>
                    <p style={{ fontSize: 11, color: "var(--fm-red)", marginBottom: 6 }}>EVITAR</p>
                    <TagList items={hashtags.evite} />
                  </div>
                ) : null}
              </div>
            </Card>
          )}

          {(visual.paleta_cores?.length || visual.tipografia) && (
            <Card>
              <SectionTitle>Identidade visual</SectionTitle>
              {visual.paleta_cores?.length ? (
                <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  {visual.paleta_cores.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--fm-inset)", borderRadius: 8, padding: "6px 10px" }}>
                      <span style={{ width: 20, height: 20, borderRadius: 5, background: c.hex, border: "1px solid var(--fm-border)", flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600 }}>{c.nome} · {c.hex}</p>
                        {c.uso && <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>{c.uso}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              {visual.tipografia && (
                <p style={{ fontSize: 13, marginBottom: 10 }}>
                  <strong>Tipografia:</strong> {visual.tipografia.display} (títulos) · {visual.tipografia.texto} (corpo)
                </p>
              )}
              {visual.estilo_grafico && <p style={{ fontSize: 13, marginBottom: 8, color: "var(--fm-muted)" }}>{visual.estilo_grafico}</p>}
              {visual.estilo_fotografico && <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>{visual.estilo_fotografico}</p>}
            </Card>
          )}

          {stories.length > 0 && (
            <Card>
              <SectionTitle>Stories recorrentes</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stories.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{s.tipo}</p>
                      {s.descricao && <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 2 }}>{s.descricao}</p>}
                    </div>
                    {s.frequencia && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "var(--fm-hover)", color: "var(--fm-muted)", flexShrink: 0 }}>
                        {s.frequencia}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {kpis.length > 0 && (
            <Card>
              <SectionTitle>KPIs a acompanhar</SectionTitle>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ color: "var(--fm-muted)", textAlign: "left" }}>
                      <th style={{ padding: "6px 8px" }}>KPI</th>
                      <th style={{ padding: "6px 8px" }}>Baseline</th>
                      <th style={{ padding: "6px 8px" }}>30d</th>
                      <th style={{ padding: "6px 8px" }}>60d</th>
                      <th style={{ padding: "6px 8px" }}>90d</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.map((k, i) => (
                      <tr key={i} style={{ borderTop: "1px solid var(--fm-border)" }}>
                        <td style={{ padding: "8px", fontWeight: 600 }}>{k.kpi}</td>
                        <td style={{ padding: "8px" }}>{k.baseline}</td>
                        <td style={{ padding: "8px", color: "var(--fm-accent)" }}>{k.meta_30d}</td>
                        <td style={{ padding: "8px", color: "var(--fm-accent)" }}>{k.meta_60d}</td>
                        <td style={{ padding: "8px", color: "var(--fm-accent)" }}>{k.meta_90d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {(plano.briefing_redatores || plano.briefing_designers) && (
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {plano.briefing_redatores && (
                  <div>
                    <SectionTitle>Briefing — redatores</SectionTitle>
                    <p style={{ fontSize: 13, lineHeight: 1.6 }}>{plano.briefing_redatores}</p>
                  </div>
                )}
                {plano.briefing_designers && (
                  <div>
                    <SectionTitle>Briefing — designers</SectionTitle>
                    <p style={{ fontSize: 13, lineHeight: 1.6 }}>{plano.briefing_designers}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {calendario.length > 0 && (
            <Card>
              <SectionTitle>Calendário de 30 dias ({calendario.length} posts)</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {calendario.map((d, i) => (
                  <details key={i} style={{ background: "var(--fm-inset)", borderRadius: 8, padding: "10px 14px" }}>
                    <summary style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                      <span>
                        <strong>Dia {d.dia}</strong> ({d.dia_semana}) — {d.tema}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--fm-muted)", flexShrink: 0, marginLeft: 12 }}>
                        {d.formato}
                      </span>
                    </summary>
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--fm-border)", fontSize: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                      {d.pilar && <p><strong>Pilar:</strong> {d.pilar}</p>}
                      {d.objetivo && <p><strong>Objetivo:</strong> {d.objetivo}</p>}
                      {d.gancho_3s && <p><strong>Gancho:</strong> {d.gancho_3s}</p>}
                      {d.legenda_completa && <p style={{ whiteSpace: "pre-wrap", color: "var(--fm-muted)" }}><strong>Legenda:</strong> {d.legenda_completa}</p>}
                      {d.cta && <p><strong>CTA:</strong> {d.cta}</p>}
                    </div>
                  </details>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
