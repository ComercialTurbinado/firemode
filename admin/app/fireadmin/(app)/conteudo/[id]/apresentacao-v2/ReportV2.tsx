import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Compass,
  Crosshair,
  ExternalLink,
  Gauge,
  ListChecks,
  Layers3,
  Search,
  ShieldCheck,
  Target,
  Wrench,
} from "lucide-react";
import type {
  RelatorioV2Action,
  RelatorioV2ChannelDiagnostic,
  RelatorioV2Data,
  RelatorioV2Movement,
  RelatorioV2Stage,
} from "@/lib/relatorio-v2";
import Reveal from "./Reveal";
import ReportActions from "./ReportActions";
import styles from "./report-v2.module.css";

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function toneFromScore(score: number | null) {
  if (score == null) return styles.toneNeutral;
  if (score >= 75) return styles.toneGood;
  if (score >= 50) return styles.toneAttention;
  return styles.toneCritical;
}

function stageIcon(id: RelatorioV2Stage["id"]) {
  if (id === "descoberta") return <Search aria-hidden="true" size={19} />;
  if (id === "confianca") return <ShieldCheck aria-hidden="true" size={19} />;
  if (id === "conversao") return <Target aria-hidden="true" size={19} />;
  return <Layers3 aria-hidden="true" size={19} />;
}

function confidenceLabel(movement: RelatorioV2Movement) {
  if (movement.confidence === "alta") return "Confiança alta";
  if (movement.confidence === "media") return "Validar premissas";
  return "Não publicar sem validar";
}

function quadrantFor(movement: RelatorioV2Movement) {
  if (movement.impact === "alto" && movement.effort !== "alto") return "quick";
  if (movement.impact === "alto") return "strategic";
  if (movement.effort === "baixo") return "support";
  return "later";
}

const QUADRANTS = [
  { id: "quick", title: "Fazer primeiro", sub: "Alto impacto, esforço controlado" },
  { id: "strategic", title: "Movimento estratégico", sub: "Alto impacto, maior coordenação" },
  { id: "support", title: "Apoiar o plano", sub: "Ganho incremental de baixo esforço" },
  { id: "later", title: "Deixar para depois", sub: "Não compete com as prioridades" },
];

function severityLabel(severity: "critico" | "atencao" | "oportunidade") {
  if (severity === "critico") return "Crítico";
  if (severity === "atencao") return "Atenção";
  return "Oportunidade";
}

function impactLabel(value: RelatorioV2Action["impact"]) {
  if (value === "alto") return "Alto impacto";
  if (value === "baixo") return "Impacto incremental";
  return "Médio impacto";
}

function ChannelDiagnostic({
  channel,
  index,
}: {
  channel: RelatorioV2ChannelDiagnostic;
  index: number;
}) {
  const assignedSolutions = new Set(
    channel.diagnosticItems
      .map((item) => item.solution?.title)
      .filter((title): title is string => Boolean(title)),
  );
  const complementaryActions = channel.actions.filter((action) => !assignedSolutions.has(action.title));

  return (
    <article className={styles.channelDiagnostic} id={`diagnostico-${channel.id}`}>
      <header className={styles.channelDiagnosticHeader}>
        <div className={styles.channelChapter}>{String(index + 1).padStart(2, "0")}</div>
        <div className={styles.channelTitleBlock}>
          <div className={styles.channelTitleLine}>
            <h3>{channel.label}</h3>
            <span className={`${styles.auditStatus} ${styles[`auditStatus_${channel.status}`]}`}>
              {channel.status === "auditado" ? "Auditado" : channel.status === "validar" ? "Validar fonte" : "Parcial"}
            </span>
          </div>
          {channel.summary ? <p>{channel.summary}</p> : null}
        </div>
        <div className={styles.channelScoreBlock}>
          <strong>{channel.score ?? "—"}</strong>
          <span>{channel.score == null ? "sem nota válida" : "nota diagnóstica"}</span>
        </div>
      </header>

      {channel.scoreRationale ? (
        <div className={styles.scoreRationale}>
          <Gauge aria-hidden="true" size={18} />
          <p><strong>Por que a nota mudou:</strong> {channel.scoreRationale}</p>
        </div>
      ) : null}

      <div className={styles.channelCounts}>
        <span><CircleAlert aria-hidden="true" size={15} /> {channel.issues.length} achados acionáveis</span>
        <span><Wrench aria-hidden="true" size={15} /> {channel.actions.length} intervenções possíveis</span>
        <span><CheckCircle2 aria-hidden="true" size={15} /> {channel.strengths.length} ativos a preservar</span>
      </div>

      {channel.validationNote ? (
        <div className={styles.validationNote}>
          <CircleAlert aria-hidden="true" size={17} />
          <span>{channel.validationNote}</span>
        </div>
      ) : null}

      <section className={styles.diagnosticInventory} aria-labelledby={`problemas-${channel.id}`}>
        <div className={styles.inventoryHeading}>
          <div>
            <span className={styles.cardLabel}>Diagnóstico ligado à execução</span>
            <h4 id={`problemas-${channel.id}`}>Categoria, problema e solução correspondente</h4>
          </div>
          <ListChecks aria-hidden="true" size={22} />
        </div>

        <div className={styles.diagnosticItemList}>
          {channel.diagnosticItems.length ? channel.diagnosticItems.map((item, itemIndex) => (
            <article className={styles.diagnosticItem} key={`${item.problem.title}-${itemIndex}`}>
              <div className={styles.diagnosticCategory}>
                <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                <div>
                  <small>Categoria</small>
                  <strong>{item.category}</strong>
                </div>
              </div>

              <div className={styles.diagnosticProblem}>
                <div className={styles.diagnosticLabelLine}>
                  <small>Problema identificado</small>
                  <span className={`${styles.severityBadge} ${styles[`severity_${item.problem.severity}`]}`}>
                    {severityLabel(item.problem.severity)}
                  </span>
                </div>
                <h5>{item.problem.title}</h5>
                {item.problem.evidence ? (
                  <p><strong>Evidência:</strong> {item.problem.evidence}</p>
                ) : (
                  <p className={styles.evidencePending}>Evidência registrada no checklist técnico do canal.</p>
                )}
              </div>

              <div className={styles.diagnosticSolution}>
                <div className={styles.diagnosticLabelLine}>
                  <small>Solução da Firemode</small>
                  {item.solution ? (
                    <div className={styles.solutionMeta}>
                      <span>{item.solution.timeline}</span>
                      <span>{impactLabel(item.solution.impact)}</span>
                      <span>Esforço {item.solution.effort}</span>
                    </div>
                  ) : null}
                </div>
                {item.solution ? (
                  <>
                    <h5>{item.solution.title}</h5>
                    {item.solution.how ? <p><strong>Direção:</strong> {item.solution.how}</p> : null}
                    {item.solution.why ? <p><strong>Por que importa:</strong> {item.solution.why}</p> : null}
                    <div className={styles.executionPlan}>
                      <div>
                        <small>Frente técnica</small>
                        <p>{item.solution.technicalAction}</p>
                      </div>
                      <div>
                        <small>Frente editorial</small>
                        <p>{item.solution.editorialAction}</p>
                      </div>
                      <div>
                        <small>Responsável sugerido</small>
                        <p>{item.solution.owner}</p>
                      </div>
                      <div>
                        <small>Considerar concluído quando</small>
                        <p>{item.solution.doneWhen}</p>
                      </div>
                    </div>
                    <div className={styles.actionOutcome}>
                      <Crosshair aria-hidden="true" size={17} />
                      <p><strong>Resultado esperado:</strong> {item.solution.expectedResult}</p>
                    </div>
                  </>
                ) : (
                  <p className={styles.solutionPending}>A causa precisa ser validada antes de definir uma solução responsável.</p>
                )}
              </div>
            </article>
          )) : <div className={styles.compactEmpty}>Nenhum problema publicável neste canal.</div>}
        </div>

        {complementaryActions.length ? (
          <div className={styles.complementaryActions}>
            <div className={styles.complementaryHeading}>
              <Wrench aria-hidden="true" size={20} />
              <div>
                <small>Ações complementares</small>
                <h5>Intervenções adicionais que ampliam o resultado</h5>
              </div>
            </div>
            <div className={styles.complementaryGrid}>
              {complementaryActions.map((action, actionIndex) => (
                <article className={styles.actionRow} key={`${action.title}-${actionIndex}`}>
                  <div className={styles.actionTopline}>
                    <span>{String(actionIndex + 1).padStart(2, "0")}</span>
                    <div>
                      <small>{action.category}</small>
                      <small>{action.timeline}</small>
                      <small>{impactLabel(action.impact)}</small>
                    </div>
                  </div>
                  <h5>{action.title}</h5>
                  <div className={styles.compactExecutionPlan}>
                    <p><strong>Técnico:</strong> {action.technicalAction}</p>
                    <p><strong>Editorial:</strong> {action.editorialAction}</p>
                    <p><strong>Concluído quando:</strong> {action.doneWhen}</p>
                  </div>
                  <div className={styles.actionOutcome}>
                    <Crosshair aria-hidden="true" size={17} />
                    <p><strong>Resultado esperado:</strong> {action.expectedResult}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <footer className={styles.expectedOutcome}>
        <Target aria-hidden="true" size={20} />
        <div>
          <span>Visão após os ajustes</span>
          <p>{channel.expectedOutcome}</p>
        </div>
      </footer>
    </article>
  );
}

export default function ReportV2({ data }: { data: RelatorioV2Data }) {
  const printableChannels = data.channels.filter((channel) => channel.nota != null);
  const reviewCount = data.movements.filter((movement) => movement.confidence !== "alta").length
    + data.qualityNotes.length;

  return (
    <main className={styles.reportShell}>
      <div className={styles.reportTopbar}>
        <div className={styles.brandLockup}>
          <span className={styles.brandMark} aria-hidden="true">F</span>
          <span>Firemode</span>
          <span className={styles.versionBadge}>Relatório V2</span>
        </div>
        <ReportActions id={data.id} />
      </div>

      <article className={styles.report}>
        <Reveal>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrowRow}>
                <span className={styles.eyebrow}>Diagnóstico executivo de presença</span>
                {reviewCount > 0 ? (
                  <span className={styles.reviewBadge}>
                    <CircleAlert aria-hidden="true" size={14} />
                    {reviewCount} {reviewCount === 1 ? "validação pendente" : "validações pendentes"}
                  </span>
                ) : (
                  <span className={styles.approvedBadge}>
                    <CheckCircle2 aria-hidden="true" size={14} />
                    Evidências revisadas
                  </span>
                )}
              </div>
              <p className={styles.companyName}>{data.company}</p>
              <h1>{data.thesis}</h1>
              <p className={styles.heroSummary}>{data.executiveSummary}</p>
              <div className={styles.metaRow}>
                <a href={data.url} target="_blank" rel="noopener noreferrer">
                  {data.url.replace(/^https?:\/\//, "")}
                  <ExternalLink aria-hidden="true" size={14} />
                </a>
                {data.niche ? <span>{data.niche}</span> : null}
                <time dateTime={data.generatedAt}>{formatDate(data.generatedAt)}</time>
              </div>
            </div>

            <aside className={styles.decisionCard} aria-label="Decisão recomendada">
              <div className={styles.decisionIcon}><Compass aria-hidden="true" size={22} /></div>
              <p className={styles.cardLabel}>Decisão recomendada</p>
              <p className={styles.decisionText}>{data.decision}</p>
              <div className={styles.overallScore}>
                <span>{data.overallScore ?? "-"}</span>
                <div>
                  <strong>Índice geral</strong>
                  <small>Contexto, não prioridade</small>
                </div>
              </div>
            </aside>
          </header>
        </Reveal>

        <Reveal className={styles.sectionCompact}>
          <section className={styles.scopeCard} aria-labelledby="escopo-diagnostico">
            <div className={styles.scopeIntro}>
              <span className={styles.sectionKicker}>Escopo auditado</span>
              <h2 id="escopo-diagnostico">A prioridade organiza o ataque. Ela não esconde a dimensão do trabalho.</h2>
              <p>O resumo executivo aponta por onde começar; o diagnóstico completo abaixo registra tudo o que foi identificado e tudo o que a Firemode pode executar.</p>
            </div>
            <div className={styles.scopeMetrics}>
              <div><strong>{data.diagnosticScope.auditedChannels}</strong><span>frentes analisadas</span></div>
              <div><strong>{data.diagnosticScope.totalProblems}</strong><span>achados acionáveis</span></div>
              <div><strong>{data.diagnosticScope.criticalProblems}</strong><span>problemas críticos</span></div>
              <div><strong>{data.diagnosticScope.totalActions}</strong><span>intervenções possíveis</span></div>
              <div><strong>{data.diagnosticScope.highImpactActions}</strong><span>ações de alto impacto</span></div>
            </div>
          </section>
        </Reveal>

        <Reveal className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionKicker}>01 · Jornada</span>
              <h2>Onde a presença ajuda ou interrompe a decisão</h2>
            </div>
            <p>As notas por canal foram reorganizadas conforme o papel que exercem na jornada.</p>
          </div>

          <div className={styles.stageGrid}>
            {data.stages.map((stage) => (
              <article className={styles.stageCard} key={stage.id}>
                <div className={`${styles.stageIcon} ${toneFromScore(stage.score)}`}>
                  {stageIcon(stage.id)}
                </div>
                <div className={styles.stageScoreRow}>
                  <h3>{stage.label}</h3>
                  <span className={toneFromScore(stage.score)}>{stage.score ?? "-"}</span>
                </div>
                <p>{stage.summary}</p>
                <small>{stage.channels.join(" · ") || "Dados insuficientes"}</small>
              </article>
            ))}
          </div>

          <div className={styles.channelPanel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.cardLabel}>Leitura por canal</span>
                <h3>Precisão para comparar, não para decidir sozinha</h3>
              </div>
              <Gauge aria-hidden="true" size={22} />
            </div>
            <div className={styles.channelList}>
              {printableChannels.map((channel) => (
                <div className={styles.channelRow} key={channel.id}>
                  <div className={styles.channelLabel}>
                    <span>{channel.label}</span>
                    <small>{channel.detalhe}</small>
                  </div>
                  <div
                    className={styles.barTrack}
                    role="img"
                    aria-label={`${channel.label}: ${channel.nota} de 100`}
                  >
                    <span
                      className={`${styles.barFill} ${toneFromScore(channel.nota)}`}
                      style={{ width: `${Math.max(2, Number(channel.nota || 0))}%` }}
                    />
                  </div>
                  <strong className={toneFromScore(channel.nota)}>{channel.nota}</strong>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionKicker}>02 · Prioridade</span>
              <h2>Três movimentos para começar — sem reduzir o restante</h2>
            </div>
            <p>As prioridades definem dependência e ordem. O inventário completo continua documentado na seção seguinte.</p>
          </div>

          <div className={styles.movementList}>
            {data.movements.length ? data.movements.map((movement) => (
              <article className={styles.movementCard} key={`${movement.order}-${movement.title}`}>
                <div className={styles.movementOrder}>{String(movement.order).padStart(2, "0")}</div>
                <div className={styles.movementBody}>
                  <div className={styles.movementTopline}>
                    <span>{movement.channel}</span>
                    <span className={`${styles.confidenceBadge} ${styles[`confidence_${movement.confidence}`]}`}>
                      {confidenceLabel(movement)}
                    </span>
                  </div>
                  <h3>{movement.title}</h3>
                  <p className={styles.gapText}>{movement.gap}</p>

                  <div className={styles.evidenceStrip}>
                    <BarChart3 aria-hidden="true" size={18} />
                    <div>
                      <small>Evidência observada</small>
                      <strong>{movement.evidence}</strong>
                    </div>
                  </div>

                  {movement.validationNote ? (
                    <div className={styles.validationNote}>
                      <CircleAlert aria-hidden="true" size={17} />
                      <span>{movement.validationNote}</span>
                    </div>
                  ) : null}

                  <div className={styles.movementDetails}>
                    <div>
                      <small>Impacto no negócio</small>
                      <p>{movement.consequence}</p>
                    </div>
                    <div>
                      <small>Ação recomendada</small>
                      <p>{movement.action}</p>
                    </div>
                    <div>
                      <small>KPI</small>
                      <p>{movement.kpi}</p>
                    </div>
                  </div>
                </div>
              </article>
            )) : (
              <div className={styles.emptyState}>
                <Target aria-hidden="true" size={24} />
                <p>O plano ainda não possui três movimentos aprovados.</p>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionKicker}>03 · Diagnóstico completo</span>
              <h2>Cada achado termina em uma ação executável.</h2>
            </div>
            <p>Cada frente mostra a evidência, o trabalho técnico, a orientação editorial, quem deve assumir e como conferir a entrega.</p>
          </div>

          {data.channelDiagnostics.length ? (
            <>
              <nav className={styles.diagnosticIndex} aria-label="Índice do diagnóstico completo">
                {data.channelDiagnostics.map((channel) => (
                  <a href={`#diagnostico-${channel.id}`} key={channel.id}>
                    <span>{channel.label}</span>
                    <small>{channel.issues.length} achados · {channel.actions.length} ações</small>
                  </a>
                ))}
              </nav>
              <div className={styles.channelDiagnosticList}>
                {data.channelDiagnostics.map((channel, index) => (
                  <ChannelDiagnostic channel={channel} index={index} key={channel.id} />
                ))}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>Os achados detalhados ainda não foram vinculados a esta análise.</div>
          )}
        </Reveal>

        <Reveal className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionKicker}>04 · Plano de ataque</span>
              <h2>Todo o trabalho ordenado em 7, 15 e 30 dias</h2>
            </div>
            <p>O cliente enxerga a complexidade completa, mas também entende dependências, ritmo e sequência de execução.</p>
          </div>
          <div className={styles.roadmapGrid}>
            {data.roadmap.map((phase) => (
              <section className={styles.roadmapPhase} key={phase.id}>
                <header>
                  <span>{phase.id}</span>
                  <div>
                    <h3>{phase.label}</h3>
                    <p>{phase.objective}</p>
                  </div>
                </header>
                <div className={styles.roadmapActions}>
                  {phase.actions.length ? phase.actions.map((action, index) => (
                    <div key={`${action.channel}-${action.title}-${index}`}>
                      <small>{action.channel}</small>
                      <strong>{action.title}</strong>
                      <p>{action.doneWhen}</p>
                    </div>
                  )) : <p className={styles.roadmapEmpty}>Nenhuma ação classificada nesta fase.</p>}
                </div>
              </section>
            ))}
          </div>
        </Reveal>

        <Reveal className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionKicker}>05 · Escolha</span>
              <h2>Impacto x esforço</h2>
            </div>
            <p>A matriz explica por que uma ação entra agora e outra deve esperar.</p>
          </div>
          <div className={styles.matrixGrid}>
            {QUADRANTS.map((quadrant) => {
              const items = data.movements.filter((movement) => quadrantFor(movement) === quadrant.id);
              return (
                <div className={styles.matrixCell} key={quadrant.id}>
                  <div>
                    <h3>{quadrant.title}</h3>
                    <p>{quadrant.sub}</p>
                  </div>
                  <ul>
                    {items.length ? items.map((item) => (
                      <li key={item.order}>
                        <span>{item.order}</span>
                        {item.title}
                      </li>
                    )) : <li className={styles.mutedListItem}>Nenhum movimento</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal className={styles.section}>
          <div className={styles.splitGrid}>
            <section className={styles.dataCard}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.sectionKicker}>06 · Confiança</span>
                  <h2>Reputação pública</h2>
                </div>
                <ShieldCheck aria-hidden="true" size={22} />
              </div>

              {data.reputation ? (
                <>
                  <div className={styles.reputationStats}>
                    <div><strong>{data.reputation.rating ?? "-"}</strong><span>Avaliação Google</span></div>
                    <div><strong>{data.reputation.reviewCount?.toLocaleString("pt-BR") ?? "-"}</strong><span>Avaliações</span></div>
                    <div><strong>{data.reputation.sentimentIndex ?? "-"}</strong><span>Índice de sentimento</span></div>
                  </div>
                  <p className={styles.methodNote}>
                    Índice estimado com avaliações públicas
                    {data.reputation.sentimentSample ? ` (n = ${data.reputation.sentimentSample})` : ""}; não substitui pesquisa NPS.
                  </p>
                  <div className={styles.themeColumns}>
                    <div>
                      <small>Sinais positivos</small>
                      <ul>{data.reputation.positiveThemes.length
                        ? data.reputation.positiveThemes.map((theme) => <li key={theme}>{theme}</li>)
                        : <li>Sem temas suficientes</li>}
                      </ul>
                    </div>
                    <div>
                      <small>Pontos de atenção</small>
                      <ul>{data.reputation.negativeThemes.length
                        ? data.reputation.negativeThemes.map((theme) => <li key={theme}>{theme}</li>)
                        : <li>Sem recorrência validada</li>}
                      </ul>
                    </div>
                  </div>
                  <div className={styles.sourceStatus}>
                    <span>Reclame Aqui</span>
                    <strong>{data.reputation.reclameAquiStatus.replaceAll("_", " ")}</strong>
                  </div>
                </>
              ) : <div className={styles.emptyState}>Sem dados públicos de reputação.</div>}
            </section>

            <section className={styles.dataCard}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.sectionKicker}>07 · Mercado</span>
                  <h2>Quem ocupa a atenção</h2>
                </div>
                <Compass aria-hidden="true" size={22} />
              </div>
              <p className={styles.competitorScope}>
                <strong>{data.competitorScope.mapped} concorrentes mapeados.</strong>{" "}
                A análise aprofunda até três — {data.competitorScope.analyzed} selecionados nesta edição — com até{" "}
                {data.competitorScope.postLimit} posts e {data.competitorScope.commentsLimit} comentários no total por concorrente.
              </p>
              <div className={styles.competitorList}>
                {data.competitors.length ? data.competitors.map((competitor, index) => (
                  <article key={`${competitor.name}-${index}`}>
                    <span className={styles.rank}>{index + 1}</span>
                    <div>
                      <h3>{competitor.name}</h3>
                      <p>{competitor.domain || "Domínio não identificado"}</p>
                    </div>
                    <div className={styles.competitorMeta}>
                      <strong>{competitor.appearances}</strong>
                      <small>aparições</small>
                      <span>{competitor.status}</span>
                    </div>
                  </article>
                )) : <div className={styles.emptyState}>Confirme até três concorrentes diretos.</div>}
              </div>
            </section>
          </div>
        </Reveal>

        <Reveal className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionKicker}>08 · Próxima execução</span>
              <h2>Conteúdo entra como consequência do plano</h2>
            </div>
            <p>Somente três peças aparecem aqui; o restante permanece no workspace de produção.</p>
          </div>
          <div className={styles.contentGrid}>
            {data.content.length ? data.content.map((item, index) => (
              <article className={styles.contentCard} key={`${item.title}-${index}`}>
                <div className={styles.contentMeta}>
                  <span>{item.platform}</span>
                  <span>{item.funnelStage}</span>
                  <span>{item.status}</span>
                </div>
                <h3>{item.title}</h3>
                {item.angle ? <p>{item.angle}</p> : <p>Ângulo será refinado na revisão editorial.</p>}
                <small>Vincular ao movimento {Math.min(index + 1, Math.max(1, data.movements.length))}</small>
              </article>
            )) : <div className={styles.emptyState}>Nenhuma peça completa foi selecionada para esta entrega.</div>}
          </div>
        </Reveal>

        {data.doNotDoNow.length ? (
          <Reveal className={styles.sectionCompact}>
            <div className={styles.notNowCard}>
              <div>
                <Clock3 aria-hidden="true" size={20} />
                <h2>O que não fazer agora</h2>
              </div>
              <ul>{data.doNotDoNow.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </Reveal>
        ) : null}

        <Reveal className={styles.sectionCompact}>
          <section className={styles.ctaCard}>
            <span className={styles.sectionKicker}>Próximo passo</span>
            <h2>Transformar o inventário completo em um Sprint de execução de 30 dias</h2>
            <p>As prioridades entram primeiro, sem perder de vista todas as correções, dependências e oportunidades que compõem o resultado.</p>
            <Link href={`/fireadmin/conteudo/${data.id}`} className={styles.ctaLink}>
              Preparar Sprint
              <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </section>
        </Reveal>

        <footer className={styles.reportFooter}>
          <details>
            <summary>Metodologia e validações deste diagnóstico</summary>
            <div>
              <p>Dados públicos e sinais dos canais foram reorganizados por jornada. Quando a nota técnica de origem entra em conflito com problemas acionáveis, a V2 aplica uma recalibração por quantidade e gravidade dos achados, sem aumentar a nota original. A nota geral serve como contexto; a prioridade vem das evidências e do impacto esperado.</p>
              {data.qualityNotes.length ? (
                <ul>{data.qualityNotes.map((note) => <li key={note}>{note}</li>)}</ul>
              ) : <p>Nenhum alerta automático de qualidade nesta prévia.</p>}
            </div>
          </details>
          <p>Firemode · Presença que vende · Relatório V2</p>
        </footer>
      </article>
    </main>
  );
}
