# Handoff de produto - Relatório de Presença v2

Status: pronto para refinamento técnico  
Prioridade: P0 para a oferta comercial de Presença  
Público deste documento: produto, engenharia, design e operação  
Caso de referência: relatório D4U Immigration gerado em 04/08/2026

## 1. Objetivo

Transformar a análise de presença em um instrumento de decisão comercial, com evidências verificáveis, três prioridades e um caminho claro para execução.

O cliente não deve receber uma cópia visual do banco de dados. Ele deve receber uma narrativa executiva:

```text
Onde a marca perde atenção -> evidência -> impacto -> decisão -> ação -> KPI -> evolução
```

O sistema interno continua armazenando o detalhe técnico. A apresentação web e o PDF consomem somente dados normalizados, validados e aprovados.

## 2. Diagnóstico do estado atual

### 2.1 Problemas observados no PDF da D4U

1. Objetos são renderizados como JSON bruto em marca, plano, reputação, percepção e outros blocos.
2. Meta Ads exibe `[object Object]`.
3. Há tabelas e colunas cortadas nas páginas de Site, Busca e IA.
4. A numeração pula da seção 9 para a 11 quando o bloco 10 não existe.
5. O relatório inclui até 40 peças, muitas com apenas título ou palavras genéricas como `dor`, `autoridade` e `curiosidade`.
6. O NPS é inferido de uma amostra de reviews e apresentado como NPS real.
7. O Reclame Aqui teve timeout, mas ainda influencia a narrativa e o plano.
8. O `llms.txt` retornou HTML de aproximadamente 829 KB e foi marcado como válido.
9. O Tech SEO aparece com nota 100 enquanto o resumo afirma que a experiência móvel precisa melhorar.
10. Perfis sociais sem handle podem aparecer com score.
11. Concorrentes globais, portais e concorrentes locais aparecem na mesma lista sem validação.
12. O UUID interno da análise aparece no rodapé do cliente.
13. Conteúdo com alegações legais, regulatórias ou de performance pode ser gerado sem fonte e sem aprovação.

### 2.2 Causa estrutural no código

O gerador de PDF em `lib/cliente-apresentacao-pdf.ts` lê diretamente `diagnostico`, `presenca` e `pecas_conteudo`. O helper `txt()` usa `JSON.stringify()` como fallback para objetos.

A apresentação web em `app/(app)/conteudo/[id]/apresentacao/page.tsx` já utiliza extratores como:

- `extrairReputacao()`;
- `extrairEvolucao()`;
- `extrairProximaExecucao()`;
- `extrairTeseTopo()`;
- `extrairMidiaComparativo()`.

Hoje existem duas interpretações do mesmo relatório: uma para web e outra, mais crua, para PDF. Essa duplicidade permite divergências e vazamento de dados internos.

## 3. Decisão de arquitetura

Criar um único `RelatorioClienteViewModel`, usado por:

- apresentação navegável;
- modo deck;
- exportação PDF;
- resumo de uma página;
- futuras versões white-label.

Fluxo obrigatório:

```text
Supabase/API
  -> normalização
  -> validação de fonte
  -> cálculo de confiança
  -> revisão humana
  -> RelatorioClienteViewModel
  -> web / deck / PDF
```

### 3.1 Arquivos sugeridos

```text
lib/relatorio-cliente/types.ts
lib/relatorio-cliente/build-view-model.ts
lib/relatorio-cliente/validators.ts
lib/relatorio-cliente/formatters.ts
lib/relatorio-cliente/priority.ts

app/(app)/conteudo/[id]/apresentacao/components/
  ReportHero.tsx
  JourneyHealth.tsx
  EvidenceCard.tsx
  OpportunityMatrix.tsx
  MovementPlan.tsx
  ReputationSummary.tsx
  CompetitorComparison.tsx
  ContentExecutionPreview.tsx
  MethodologyAppendix.tsx
  InternalQualityBanner.tsx
```

`lib/cliente-apresentacao-pdf.ts` deve parar de montar a narrativa a partir dos objetos brutos. Ele deve receber o mesmo ViewModel da apresentação e atuar somente como renderer/exportador.

## 4. Contrato de dados mínimo

```ts
type DataStatus = "available" | "partial" | "failed" | "not_applicable";
type Confidence = "high" | "medium" | "low";
type ReviewStatus = "pending" | "approved" | "rejected";
type Visibility = "internal" | "appendix" | "presentation";

type Evidence = {
  label: string;
  value: string | number | null;
  sourceLabel: string;
  sourceUrl?: string | null;
  capturedAt: string;
  sampleSize?: number | null;
  status: DataStatus;
  confidence: Confidence;
  note?: string | null;
};

type Finding = {
  id: string;
  channel: string;
  title: string;
  observation: string;
  businessImpact: string;
  evidence: Evidence[];
  severity: 1 | 2 | 3 | 4 | 5;
  expectedImpact: 1 | 2 | 3 | 4 | 5;
  effort: 1 | 2 | 3 | 4 | 5;
  confidence: Confidence;
  recommendedAction: string;
  kpi: string;
  reviewStatus: ReviewStatus;
  visibility: Visibility;
};

type RelatorioClienteViewModel = {
  meta: {
    analysisId: string;
    companyName: string;
    domain: string;
    generatedAt: string;
    reviewedAt?: string | null;
    reviewedBy?: string | null;
  };
  thesis: string;
  executiveSummary: string;
  journey: JourneyStage[];
  channelScores: ChannelScore[];
  topFindings: Finding[];
  strengths: Finding[];
  competitors: CompetitorView[];
  movements: MovementView[];
  contentPreview: ContentPreview[];
  methodology: MethodologyView;
  quality: QualitySummary;
};
```

Fase 1 pode construir esse ViewModel em memória sem migração. Fase 2 pode persistir achados normalizados e estados de revisão.

## 5. Regras de validação de dados

### 5.1 Regra universal de renderização

- Nunca usar `JSON.stringify()` como fallback de apresentação.
- Renderers aceitam apenas primitivos, arrays de primitivos ou ViewModels tipados.
- Objeto inesperado gera estado interno `invalid_shape` e não aparece para o cliente.
- A exportação falha em QA se encontrar `{`, `}`, `[object Object]`, stack trace ou mensagem de provider.

### 5.2 Reclame Aqui

- Timeout, bloqueio ou resposta parcial deve gerar `status: failed` ou `partial`.
- Dado com falha não pode influenciar score, tese ou movimento prioritário.
- Uma reclamação isolada pode aparecer somente como sinal de baixa confiança, nunca como conclusão sobre a empresa.
- Exibir data, quantidade observada e fonte quando houver dados válidos.

### 5.3 Índice de reputação derivado de reviews

- Renomear `NPS` para `Índice estimado de sentimento das avaliações`.
- Texto obrigatório: `Estimativa baseada em avaliações públicas; não substitui uma pesquisa NPS.`
- Exibir `n = amostra`.
- NPS real só existe quando o cliente fornece ou integra pesquisa com a pergunta e escala corretas.
- O score de Reviews não deve somar esse indicador como se fosse NPS real.

### 5.4 `llms.txt`

Marcar como válido apenas quando:

- HTTP 200;
- conteúdo não começa com `<!DOCTYPE`, `<html` ou outra página HTML;
- tipo e corpo são compatíveis com texto;
- conteúdo tem estrutura mínima esperada;
- tamanho está dentro de limite configurável;
- URL final não redireciona silenciosamente para a home.

Caso contrário: `llms.txt não validado`, com motivo interno. Não usar esse achado como promessa de visibilidade em IA.

### 5.5 Consistência entre nota e texto

- Toda frase crítica deve apontar para um critério que reduziu a nota.
- Nota 100 bloqueia resumo com problema não contabilizado.
- Se houver problema móvel, o score de Site deve refletir o problema ou o texto deve ser reclassificado como oportunidade não pontuada.
- Alteração manual de texto deve disparar recálculo ou aviso de inconsistência.

### 5.6 Redes sociais

- Score exige evidência de perfil identificado.
- Sem handle/URL validado: canal `partial` ou `failed`, não nota numérica final.
- Exibir período e tamanho da amostra para frequência e engajamento.

### 5.7 Meta Ads

- Ausência de anúncio é `canal não utilizado`, não automaticamente `gap`.
- Só recomendar teste de mídia após validar oferta, capacidade comercial, geografia, landing page e orçamento.
- Score deve diferenciar: sem dados, sem anúncio, anúncio ativo e performance conhecida.

### 5.8 Concorrentes

- Separar `direto`, `referência`, `portal` e `não validado`.
- A apresentação principal mostra no máximo três concorrentes diretos.
- Operação precisa confirmar concorrentes antes da aprovação final.
- Concorrente com zero aparições não recebe destaque na narrativa.

### 5.9 Alegações sensíveis

Exigir revisão humana e fonte para:

- leis e mudanças regulatórias;
- saúde, finanças e imigração;
- taxas de sucesso;
- garantias;
- comparações objetivas;
- promessas de resultado;
- datas como `regras de 2026`.

Peça sem fonte fica `blocked_for_review` e não entra no PDF do cliente.

## 6. Priorização

Não usar a média geral como principal instrumento de decisão. Notas altas de canais secundários podem esconder um gargalo grave.

Cada oportunidade deve receber:

```text
OpportunityScore = severity * expectedImpact * confidenceFactor / effort
```

Fatores sugeridos:

- alta confiança: `1`;
- média confiança: `0.65`;
- baixa confiança: `0.35`.

O score ordena candidatos, mas os três movimentos finais exigem aprovação humana.

## 7. Nova arquitetura do relatório do cliente

### 7.1 Apresentação principal

Máximo de dez seções narrativas:

1. **Tese executiva** - uma frase sobre o principal vazamento ou oportunidade.
2. **Jornada do cliente** - descoberta, confiança, conversão e distribuição.
3. **Mapa de saúde** - quatro dimensões, com canais como evidência secundária.
4. **Gargalo 1** - dado, evidência, impacto, ação e KPI.
5. **Gargalo 2** - mesma estrutura.
6. **Gargalo 3** - mesma estrutura.
7. **Concorrentes** - até três comparáveis e aprovados.
8. **Matriz impacto x esforço** - mostrar por que os três movimentos foram escolhidos.
9. **Plano de 30 dias** - ordem, responsável, prazo e KPI.
10. **Próxima execução** - três peças/ativos e CTA para Sprint.

### 7.2 Apêndice

- metodologia de score;
- fontes e datas;
- canais completos;
- estados parciais ou indisponíveis;
- amostras;
- glossário;
- observações de confiança.

Dados técnicos detalhados continuam apenas no admin.

### 7.3 Conteúdo

- Remover a listagem de 40 peças do PDF executivo.
- Mostrar no máximo três peças aprovadas, uma para cada movimento ou etapa do funil.
- Cada peça precisa de objetivo, canal, etapa do funil, CTA, status de revisão e vínculo com um movimento.
- Disponibilizar o restante em uma área separada de execução/backlog.
- Não considerar título ou palavra-chave como peça pronta.

## 8. Componentes e estados

| Componente | Dados | Estados obrigatórios |
|---|---|---|
| `ReportHero` | tese, empresa, data, revisão | pronto, aguardando revisão |
| `JourneyHealth` | quatro estágios e sinais | completo, parcial, sem dados |
| `EvidenceCard` | Finding + Evidence | alta/média/baixa confiança, fonte indisponível |
| `ReputationSummary` | rating, volume, temas | válido, amostra pequena, coleta falhou |
| `CompetitorComparison` | até três rivais | aprovado, aguardando confirmação |
| `OpportunityMatrix` | findings priorizados | completo, menos de três oportunidades |
| `MovementPlan` | movimento, dono, KPI, prazo | planejado, em execução, concluído, bloqueado |
| `ContentExecutionPreview` | até três peças | rascunho, revisão, aprovado, bloqueado |
| `InternalQualityBanner` | falhas e alertas | somente admin; nunca exportar |

## 9. Layout e responsividade

### Web/deck

- Desktop: conteúdo executivo em largura legível; evidências em duas colunas somente quando curtas.
- Tablet: uma coluna para evidências e concorrentes.
- Mobile: ordem narrativa preservada; tabelas viram cards; CTA fixo opcional.
- Texto longo não deve ficar dentro de grids com largura fixa.
- Detalhes técnicos abrem em disclosure e não competem com a tese.

### PDF A4

- Usar tokens de impressão para margem, tipografia, espaçamento e cores.
- Proibir grid de duas colunas quando qualquer bloco aceitar texto não limitado.
- `break-inside: avoid` em cards, movimentos e tabelas pequenas.
- Quebrar tabelas grandes por seção e repetir cabeçalho quando necessário.
- Rodapé com marca, cliente, data e página. Remover UUID interno.
- Seção opcional ausente não deve quebrar numeração.
- Gerar sumário/ordem a partir de array de seções visíveis.

## 10. Conteúdo e microcopy

### Vocabulário recomendado

- `Evidência observada` em vez de `verdade`.
- `Índice estimado de sentimento` em vez de `NPS` derivado.
- `Canal não utilizado` em vez de `oportunidade perdida` sem validação.
- `Não foi possível validar` em vez de exibir erro técnico.
- `Confiança baixa/média/alta` perto da evidência.
- `O que isso significa para o negócio` antes de `como corrigir`.

### Limites

- Tese: até 180 caracteres.
- Título de achado: até 72 caracteres.
- Observação: até 240 caracteres.
- Impacto: até 240 caracteres.
- Ação recomendada: até 220 caracteres.
- Evidência principal: uma linha; detalhes em apêndice/disclosure.

## 11. Interações

- Abrir fonte: nova aba, com rótulo acessível.
- Aprovar/rejeitar achado: somente admin, com motivo opcional obrigatório ao rejeitar.
- Confirmar concorrente: admin, persistir estado.
- Alterar prioridade: drag-and-drop opcional; oferecer botões acessíveis `subir/descer`.
- Gerar PDF: bloquear enquanto houver erro P0; permitir com alertas P1 explicitamente aprovados.
- CTA do movimento: registrar interesse no canal/movimento e abrir proposta contextual.

## 12. Acessibilidade

- Ordem de foco segue a narrativa.
- Score nunca depende somente de cor.
- Gráficos têm resumo textual.
- Cards de evidência usam títulos e listas semânticas.
- Botões têm estados de loading, disabled e mensagem de erro.
- Modal de revisão prende foco e devolve foco ao elemento de origem.
- Links externos indicam que abrem nova aba.
- PDF mantém texto selecionável e hierarquia de títulos.

## 13. Telemetria

Eventos mínimos:

```text
report_viewed
report_section_viewed
evidence_source_opened
competitor_confirmed
finding_approved
finding_rejected
movement_interest_selected
proposal_cta_clicked
pdf_export_started
pdf_export_failed
pdf_export_completed
```

Propriedades: `analysis_id`, `client_handle`, `section`, `channel`, `confidence`, `movement_id`, `report_version`.

## 14. Backlog priorizado

### P0 - não vender sem corrigir

- [ ] Criar ViewModel compartilhado para web e PDF.
- [ ] Remover fallback de objetos para JSON no renderer do cliente.
- [ ] Bloquear `[object Object]`, JSON e erros de provider na exportação.
- [ ] Corrigir validação de `llms.txt`.
- [ ] Renomear NPS derivado e remover seu uso como NPS real no score.
- [ ] Ignorar Reclame Aqui com timeout no score e na tese.
- [ ] Corrigir overflow e clipping do PDF.
- [ ] Limitar apresentação a três movimentos e três peças aprovadas.
- [ ] Remover UUID e dados internos do rodapé.
- [ ] Implementar revisão humana obrigatória antes de exportar.

### P1 - aumenta conversão e confiança

- [ ] Criar cards de evidência com fonte, data, amostra e confiança.
- [ ] Implementar jornada em quatro dimensões.
- [ ] Criar matriz impacto x esforço.
- [ ] Validar/confirmar concorrentes no admin.
- [ ] Vincular conteúdo a movimento, etapa do funil e KPI.
- [ ] Criar apêndice metodológico automático.
- [ ] Registrar interesse e CTA por movimento.
- [ ] Exibir delta before/after para clientes com histórico.

### P2 - escala

- [ ] White-label por parceiro.
- [ ] Benchmarks por vertical.
- [ ] Templates de narrativa por ICP.
- [ ] Comparação entre períodos e concorrentes.
- [ ] Casos de sucesso gerados a partir do delta aprovado.
- [ ] Área do cliente com board de execução.

## 15. Critérios de aceite com o caso D4U

Uma nova exportação da D4U só é aceita quando:

- [ ] não contém JSON bruto, `{...}` ou `[object Object]`;
- [ ] não contém texto cortado ou coluna fora da página;
- [ ] possui numeração contínua;
- [ ] mostra `Índice estimado de sentimento`, `n = 20` e o aviso metodológico;
- [ ] marca Reclame Aqui como não validado por falha de coleta;
- [ ] marca o `llms.txt` como inválido quando a resposta é HTML;
- [ ] resolve a contradição entre Site 100 e problema móvel;
- [ ] apresenta no máximo três concorrentes diretos confirmados;
- [ ] apresenta exatamente três movimentos aprovados;
- [ ] apresenta no máximo três peças completas e vinculadas aos movimentos;
- [ ] não publica alegações de imigração, garantia ou taxa de sucesso sem fonte/revisão;
- [ ] não exibe UUID interno;
- [ ] PDF e web usam o mesmo texto, score e prioridade;
- [ ] renderização visual de todas as páginas passa sem defeitos.

## 16. Definition of Done

O Relatório v2 está pronto quando:

1. existe uma única fonte de verdade de apresentação;
2. toda conclusão relevante tem evidência, data e confiança;
3. dados falhos não influenciam a recomendação;
4. operação aprova os três movimentos antes da entrega;
5. web e PDF contam a mesma história;
6. o cliente entende em menos de dois minutos onde agir primeiro;
7. o CTA leva ao Sprint correspondente ao movimento prioritário;
8. os testes automatizados e o caso visual D4U cobrem os critérios P0.

