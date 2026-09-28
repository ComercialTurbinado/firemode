# Onboarding e execução — Firemode Presença

Playbook operacional após a venda.  
Preços de referência: Radar 197 · Essencial 297 · Ativo 497 · Sprint 3.900 · Setup 6.900 · Monitor 1.970 · Operar 5.900 · Crescimento 9.900.

---

## 0) Processo geral (vale para qualquer contratação)

Toda venda passa pelos mesmos **7 estágios**. O que muda por SKU é o SLA, o checklist e quem executa.

```
PAGO → INTAKE → SETUP CONTA → KICKOFF → EXECUÇÃO → ENTREGA/REVIEW → UPSELL ou CS
```

| Estágio | O que acontece | Dono | SLA máximo |
|---|---|---|---|
| **1. PAGO** | Confirma PIX/cartão/boleto; gera contrato/recibo; tag no CRM | Closer / Financeiro | 24h |
| **2. INTAKE** | Formulário curto + URL + @ públicos; cria/atualiza cliente no admin | Closer → Ops | 24h após pagamento |
| **3. SETUP CONTA** | Cliente no admin · análise Content Machine · pasta Drive · grupo Zap | Ops | 24–48h |
| **4. KICKOFF** | Msg padrão + expectativa de prazo + o que NÃO pedimos (senha) | Ops / Closer | No mesmo dia do setup |
| **5. EXECUÇÃO** | Pipeline / auditorias / peças conforme SKU | Ops | Ver SKU |
| **6. ENTREGA** | Call ou envio + artefato (PDF/apresentação/pasta) | Ops (+ Closer se upsell) | Ver SKU |
| **7. UPSELL / CS** | Escada comercial ou saúde da conta | Closer / CS | Na entrega ou D+7 |

### Dados mínimos no intake (todos os SKUs)

Pedir **só o necessário** — sem senha de redes.

1. Nome da empresa + CNPJ/CPF (faturamento)  
2. Site (URL) — obrigatório do Essencial em diante; Radar aceita só @ IG  
3. Instagram / TikTok / YouTube públicos (se tiver)  
4. Cidade / região de atuação  
5. WhatsApp do decisor  
6. Objetivo em 1 frase (“mais lead no Zap”, “aparecer no Maps”, etc.)  
7. SKU comprado + data do pagamento  

### Setup padrão no admin (todos)

- [ ] Cliente criado/atualizado (`clientes`) com handle  
- [ ] Análise web / presença rodada (ou agendada)  
- [ ] Link da análise no CRM + pasta `Cliente / YYYY-MM / SKU`  
- [ ] Grupo WhatsApp: `Firemode | NomeEmpresa` (closer + ops + cliente)  
- [ ] Tag CRM: `sku:ativo` / `sku:operar` etc. + estágio `onboarding`  

### Regras de ouro

1. **Sem senha** em diagnóstico e Monitor. Senha só se Operar/Crescimento exigir publicação (e com termo).  
2. **1 canal dominante** no Operar — não “todas as redes”.  
3. Toda conta Operar/Crescimento tem **1 KPI** (lead WA ou SQL).  
4. Call de entrega do Ativo/Sprint = momento de upsell (playbook comercial).  
5. Atraso interno >50% do SLA → closer avisa o cliente **antes** do prazo estourar.

---

## 1) Radar — R$ 197

**Promessa:** leitura rápida de onde some + 3 prioridades.  
**Prazo:** 48–72h úteis.

### Onboarding

| Passo | Ação | Dono |
|---|---|---|
| 1 | Confirmar @ IG (ou site) | Closer |
| 2 | Rodar Radar / snapshot leve no admin | Ops |
| 3 | Montar 1 página: nota + 3 gaps + CTA “quero Essencial/Ativo” | Ops |

### Execução

1. Coletar handle  
2. Rodar análise IG (Radar) ± presença mínima se houver site  
3. Extrair 3 prioridades (sem plano longo)  
4. Enviar PDF/1-pager no Zap  

### Entrega

- Msg: “Segue o Radar. Os 3 buracos principais são A/B/C. Se quiser o mapa completo + plano + conteúdo, o próximo passo é o Pacote Ativo (R$ 497).”  
- **Upsell:** Ativo (preferencial) ou Essencial.  
- **Não oferecer** retainer na entrega do Radar (ticket baixo demais).

### Definition of Done

- [ ] 1-pager enviado  
- [ ] 3 prioridades claras  
- [ ] Tag CRM `entregue` + follow-up D+3

---

## 2) Essencial — R$ 297

**Promessa:** scorecard + gaps + plano 7/15/30 + textos-base.  
**Prazo:** 5 dias úteis.

### Onboarding

| Passo | Ação | Dono |
|---|---|---|
| 1 | Intake com URL obrigatória | Closer |
| 2 | Pipeline de presença (site + canais públicos) | Ops |
| 3 | Gerar plano de impacto | Ops |
| 4 | 3–5 textos-base (bio / CTA / headlines) | Ops |

### Execução (D0–D5)

| Dia | Trabalho |
|---|---|
| D0 | Setup conta + disparar pipeline |
| D1–D2 | Revisar scorecard (Site, GMB, Busca, IG/TT/YT, Ads, Reviews, IA) |
| D3 | Plano de impacto + textos-base |
| D4 | Review interno (ops ou você) |
| D5 | Envio + oferta de call 15 min (opcional) |

### Entrega

- Pasta: scorecard + plano 7/15/30 + textos  
- Call opcional 15 min (sem pressão forte; upsell Ativo se faltou conteúdo)  
- **Upsell:** Pacote Ativo (se não veio com roteiros) ou Sprint se gap crítico óbvio  

### Definition of Done

- [ ] Scorecard com ≥6 canais avaliados ou marcados pendentes  
- [ ] Plano 7/15/30  
- [ ] Textos-base entregues  
- [ ] Follow-up D+5

---

## 3) Pacote Ativo — R$ 497 ★ (entrada âncora)

**Promessa:** Essencial + 7 roteiros + rivais + 1º conteúdo fresco.  
**Prazo:** 7 dias úteis.

### Onboarding

Igual Essencial + confirmação do **canal dominante** (default IG Reels se não disser).

Msg kickoff:

> “Recebemos o pagamento. Em até 7 dias úteis você recebe: mapa da presença, plano do que consertar, leitura de rivais e 7 roteiros pro canal [X]. Não pedimos senha. Qualquer dúvida, responde neste grupo.”

### Execução (D0–D7)

| Dia | Trabalho | Ferramenta |
|---|---|---|
| D0 | Intake + setup + pipeline presença | Admin / CM |
| D1 | Scorecard + GMB/busca/reviews | CM |
| D2 | Redes + ads + IA (se aplicável) | CM |
| D3 | Plano de impacto + concorrentes + percepção (se dados) | CM |
| D4 | Trilha conteúdo: 7 roteiros no canal dominante + desIAização | CM |
| D5 | Review humano (tom, CTA, fidelidade ao diagnóstico) | Ops |
| D6 | Montar apresentação / pasta de entrega | Ops |
| D7 | **Call de entrega 20–25 min** (upsell Sprint/Operar) | Ops + Closer |

### Checklist de entrega Ativo

- [ ] Scorecard  
- [ ] Plano de impacto (3 movimentos)  
- [ ] Comparativo rivais (ao menos 1 rede ou SERP)  
- [ ] 7 roteiros/peças revisadas  
- [ ] Call agendada **antes** de só “mandar PDF”  
- [ ] Proposta Sprint (3.900) e Operar (5.900) pronta no bolso do closer  

### Definition of Done

- [ ] Call feita ou 2 tentativas + envio assíncrono  
- [ ] Resultado CRM: `sprint` / `operar` / `pensar≤5d` / `só-mapa`  
- [ ] Se “pensar”: follow-up calendário D+3 e D+5

---

## 4) Sprint Correção 30 dias — R$ 3.900

**Promessa:** consertar os **top 3 gaps** do mapa (cliente no banco do passageiro).  
**Prazo:** 30 dias corridos a partir do kickoff.

### Onboarding (D0–D2)

| Passo | Ação |
|---|---|
| 1 | Reabrir diagnóstico do Ativo/Essencial (não refazer do zero) |
| 2 | Kickoff 30 min: validar os 3 gaps + dono interno do cliente |
| 3 | Board simples: Gap1 / Gap2 / Gap3 · status · evidência |
| 4 | Definir “feito” de cada gap em 1 frase |

Exemplos de gaps típicos:

1. GMB oficial único + NAP alinhado  
2. Busca de marca / site técnico crítico  
3. Bio/CTA + ritmo do canal dominante  

### Execução (semanas)

| Semana | Foco |
|---|---|
| S1 | Gap #1 (maior receita/risco) + evidência before |
| S2 | Gap #1 fechado + Gap #2 |
| S3 | Gap #2/#3 + conteúdo de suporte se necessário |
| S4 | Fechamento · after scorecard · call de handoff → Operar |

### Rituales

- Check-in Zap **2×/semana** (ter/qui): 3 linhas — feito / bloqueio / próximo  
- Call quinzenal 20 min (semana 2 e 4)  

### Entrega final Sprint

- [ ] Before/after do scorecard (ou dos 3 itens)  
- [ ] Lista do que o cliente deve manter  
- [ ] Oferta Operar R$ 5.900 (âncora) ou Monitor se tem time interno  

### Definition of Done

- [ ] 3 gaps com status feito/parcial + motivo  
- [ ] Call de handoff realizada  
- [ ] Upsell registrado

---

## 5) Setup Presença — R$ 6.900

**Promessa:** Sprint + posicionamento + rivais + trilha 30 dias + deck interno.  
**Prazo:** 30–35 dias.

### Onboarding

Igual Sprint + alinhar **audiência do deck** (sócio, time, agência parceira).

### Execução extra (além do Sprint)

| Bloco | Entrega |
|---|---|
| Posicionamento | Bio / headline / CTA oficial (aprovado) |
| Rivais | Lista mestre + 1 slide “eles vs vocês” |
| Trilha 30 dias | Calendário editorial do canal dominante |
| Deck | Apresentação `#impacto` white-label pra uso interno |

### Definition of Done

- [ ] Tudo do Sprint  
- [ ] Deck aprovado pelo decisor  
- [ ] Trilha 30d entregue  
- [ ] Oferta Monitor (se agência interna) ou Operar

---

## 6) Monitor — R$ 1.970/mês

**Promessa:** presença viva sem operação de conteúdo.  
**Fidelidade:** 3 meses.  
**Ciclo:** alinhado ao cron 7/15/30 do cliente.

### Onboarding (D0–D3)

| Passo | Ação |
|---|---|
| 1 | Ligar auto-presença / intervalo (7, 15 ou 30 — default 15) |
| 2 | Baseline scorecard snapshot |
| 3 | Canal de alerta (Zap grupo) |
| 4 | KPI leve: “nenhum drop >10 pts sem aviso” |

### Execução mensal

| Quando | Trabalho | Tempo alvo |
|---|---|---|
| Contínuo | Cron + alertas GMB duplicata/suspeitos | Automático |
| Semanal | Glance 10 min se alerta | Ops |
| Mensal (D-2) | Relatório delta + 3 recomendações | 45–60 min |
| Mensal (D0) | Envio PDF + 1 pergunta: “quer que a gente execute?” | Closer/CS |

### O que NÃO entra no Monitor

- Produção de posts/roteiros  
- Gestão de ads  
- Calls quinzenais (só sob demanda se churn risk)

### Definition of Done (mês)

- [ ] Relatório enviado  
- [ ] Delta registrado no histórico  
- [ ] Se nota caiu ou alerta reputação → ping closer (upsell Sprint/Operar)

---

## 7) Operar — R$ 5.900/mês ★ (retainer âncora)

**Promessa:** Monitor + conteúdo no **1 canal dominante** + refresh de presença.  
**Fidelidade:** 3 meses.  
**Capacidade:** ~8–10 contas / operador.

### Onboarding (D0–D5) — crítico

| Dia | Ação |
|---|---|
| D0 | Contrato + pagamento + grupo Zap |
| D1 | Kickoff 40 min: canal dominante, KPI, tom, ofertas, restrições |
| D1 | Termo de acesso (se for publicar) — senhas só se necessário |
| D2 | Baseline presença + definição do calendário (ex.: 4 Reels/semana) |
| D3–D4 | Primeiro lote de peças (semana 1) + aprovação |
| D5 | Go-live: cliente posta ou ops publica |

**Kickoff — pauta fixa**

1. Canal dominante (1 só)  
2. KPI: leads WA / formulário / reuniões (meta numérica)  
3. O que nunca falar / compliance  
4. Horário de aprovação (SLA cliente: 48h; silêncio = aprovado)  
5. Papel do cliente vs Firemode  

### Execução semanal (ritmo)

| Dia | Ops |
|---|---|
| Seg | Brief da semana a partir do diagnóstico/impacto |
| Ter–Qua | Gerar lote (CM) + desIAização + revisão |
| Qui | Cliente aprova (ou auto se regra) |
| Sex | Publicação / entrega dos arquivos + log |
| Quinzenal | Refresh presença (pipeline TTL) + olhar delta |

### Volume padrão Operar

- **16 peças/roteiros por mês** no canal dominante (ex.: 4/semana)  
- 1 refresh de presença a cada 15 dias  
- Relatório mensal (delta + o que rodou + KPI)  
- Sem reunião fixa (só se KPI vermelho ou pedido)

### Escalação

| Sinal | Ação |
|---|---|
| Cliente não aprova >7 dias | Pausar produção; closer cobra |
| KPI 0 por 30 dias | Call 20 min + revisar canal/CTA |
| Pedido “faz todas as redes” | Upsell Crescimento ou add-on pago |

### Definition of Done (mês)

- [ ] ≥16 peças entregues/publicadas  
- [ ] 2 refreshes de presença  
- [ ] Relatório + KPI  
- [ ] Health: verde / amarelo / vermelho no CRM

---

## 8) Crescimento — R$ 9.900/mês

**Promessa:** Operar + 2º canal + GMB/busca/ads insights + reunião quinzenal + plano de impacto vivo.  
**Fidelidade:** 6 meses.  
**Capacidade:** ~5–7 contas / operador.

### Onboarding

Igual Operar + kickoff estendido (60 min) cobrindo:

- Canal 1 e Canal 2  
- Dono de ads (cliente ou Firemode só insight)  
- Meta SQL/reunião se B2B  
- Cadência de reunião quinzenal (calendário fixo)

### Execução (além do Operar)

| Item | Ritmo |
|---|---|
| Canal 2 | 8 peças/mês (ou ritmo acordado) |
| Insights GMB/busca/ads | Quinzenal no deck da reunião |
| Plano de impacto | Atualizado mensalmente |
| Reunião | 30 min / 15 dias — pauta: KPI, gaps, próximos 15 dias |
| RaaS | Oferecer após 60 dias se tracking ok |

### Definition of Done (mês)

- [ ] Tudo do Operar  
- [ ] Canal 2 no ritmo  
- [ ] 2 reuniões feitas (ou 1 + async se falta do cliente)  
- [ ] Plano de impacto atualizado  

---

## 9) RaaS (add-on) — Leads / SQL

**Só depois** de 60 dias de Operar/Crescimento com tracking.

### Onboarding RaaS

| Passo | Ação |
|---|---|
| 1 | Definir o que é lead qualificado (escrito no contrato) |
| 2 | Fonte da verdade: Zap Business / CRM / planilha |
| 3 | UTM + números de WA dedicados se possível |
| 4 | Baseline 30 dias antes do variável |

### Execução

- Fechamento mensal D+5: contagem + evidência  
- Piso do plano + variável (R$ 120/lead ou R$ 350/SQL)  
- Controvérsia: closer + ops revisam juntos; cliente tem 5 dias pra contestar  

---

## Matriz rápida — quem faz o quê

| SKU | Closer | Ops | CS | Call entrega |
|---|---|---|---|---|
| Radar | Vende + follow | Executa 1-pager | — | Não |
| Essencial | Vende | Executa | — | Opcional 15 min |
| Ativo | Vende + upsell na call | Executa | — | **Sim 20–25 min** |
| Sprint | Vende / renova | Executa gaps | — | Kickoff + handoff S4 |
| Setup | Vende | Sprint + deck | — | Kickoff + deck |
| Monitor | Expansão | Relatório | Health | Não (mensal async) |
| Operar | Expansão | Conteúdo + refresh | Health | Kickoff; call se KPI ruim |
| Crescimento | Expansão | Tudo + reunião | Health | Quinzenal |
| RaaS | Negocia | Conta leads | Concilia | Mensal D+5 |

---

## Templates de mensagem

### Kickoff (Ativo)

```
Oi, [Nome]! Aqui é a Firemode.
Pagamento confirmado do Pacote Ativo.
Em até 7 dias úteis entregamos: mapa da presença, plano do que consertar,
rivais e 7 roteiros para [canal].
Não pedimos senha de redes.
Site que vamos usar: [URL]
Qualquer ajuste, responde aqui.
```

### Kickoff (Operar)

```
Bem-vindo ao Operar.
Canal dominante: [X]
KPI do trimestre: [Y leads WA / mês]
Aprovação: vocês têm 48h; sem resposta, seguimos.
Primeira leva de conteúdo até [data].
Kickoff em [data/hora] — 40 min.
```

### Entrega Ativo → upsell

```
Mapa e os 7 roteiros estão na pasta: [link]
Na call de [data] eu mostro os 3 movimentos prioritários.
Já deixo duas opções claras:
A) Sprint 30 dias (R$ 3.900) — consertamos os 3 gaps
B) Operar (R$ 5.900/mês) — operamos o canal [X] com meta de [KPI]
```

---

## Handoff CRM (campos mínimos)

| Campo | Valores |
|---|---|
| `sku` | radar / essencial / ativo / sprint / setup / monitor / operar / crescimento |
| `stage` | pago / onboarding / execucao / entregue / retainer_ativo / churn_risk |
| `canal_dominante` | ig / tiktok / youtube / gmb / blog |
| `kpi` | texto + meta numérica |
| `health` | verde / amarelo / vermelho |
| `proxima_acao` | data + dono |
| `upsell_status` | aberto / sprint / operar / recusou / D+5 |

---

## Escala e capacidade (lembrete)

| Papel | Capacidade |
|---|---|
| Closer | 8–12 diags/mês + 3–5 upsells retainer |
| Ops Monitor | 25–35 contas |
| Ops Operar | 8–10 contas |
| Ops Crescimento | 5–7 contas |
| CS | 40–50 health + renovação |

Se ops >80% da capacidade por 2 semanas → pausar novos Operar ou contratar.  
Não vender Crescimento sem slot de reunião no calendário do ops.
