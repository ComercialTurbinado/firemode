// eslint-disable-next-line @typescript-eslint/no-explicit-any
import auditSrc from './auditDemo.json';

// Inject simulation audit data when running locally (window.__AUDIT_DATA__ not set by server)
if (typeof window !== 'undefined' && !window.__AUDIT_DATA__) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__AUDIT_DATA__ = auditSrc;
}

export const marketingData = {
  "overview_cliente": {
    "diagnostico_identidade": "O perfil @globalcitizensolutions posiciona-se como especialista em soluções de residência e cidadania global, com destaque para 15 países e 17 programas. A bio comunica autoridade internacional, mas falta clareza sobre diferenciais e chamada para ação. A taxa real de engajamento é 0.19%, acima de @haymanwoodward (0.06%) e @d4uimmigration.br (0.05%), mostrando qualidade na base, mas com volume baixo: média de apenas 10 curtidas e zero comentários por post. O mix de formatos prioriza carrosséis (67%), com poucos Reels (33%) e nenhuma foto, enquanto concorrentes como @d4uimmigration.br usam 75% de Reels, maximizando alcance. Os melhores posts são carrosséis informativos, mas sem viralização ou interação relevante. O perfil está bem construído visualmente, mas carece de ganchos fortes e CTAs claros, o que limita conversão e crescimento orgânico.",
    "posicionamento_atual": "Com 5.574 seguidores, @globalcitizensolutions está em uma liga inicial frente aos líderes @d4uimmigration.br (267.206) e @haymanwoodward (111.021). O gap de seguidores é de -97,91% em relação ao topo. Apesar de engajamento proporcionalmente maior (0.19% vs 0.05% de @d4uimmigration.br), o volume absoluto é muito inferior (10 curtidas vs 138). Para subir de liga e captar leads qualificados, o perfil precisa crescer 10x em seguidores e multiplicar a média de interações por post. O caminho é acelerar frequência, apostar em vídeos curtos e CTAs, e ampliar temas de interesse imediato do público HNWI global.",
    "pontos_fortes": [
      "Engajamento proporcional 216% maior que @haymanwoodward (0.19% vs 0.06%) — base responde bem ao conteúdo informativo.",
      "Mix de carrosséis (67%) favorece educação e retenção de informação, alinhado ao perfil de decisão do público.",
      "Posicionamento internacional claro na bio, cobrindo 15 países e 17 programas — autoridade ampla.",
      "Posts com abordagem consultiva e tom institucional, o que transmite confiança para público high ticket."
    ],
    "pontos_fracos": [
      "Zero comentários por post vs 8 de @d4uimmigration.br = perdendo conversas e oportunidades de qualificação de leads.",
      "Apenas 33% de Reels vs 75% de @d4uimmigration.br = alcance orgânico drasticamente limitado, perdendo até 4x mais impressões.",
      "Sem CTA claro na maioria dos posts, enquanto @d4uimmigration.br usa link_bio e @haymanwoodward oferece consulta gratuita — perdendo tráfego e captação imediata.",
      "Gap de seguidores de -97,91% vs @d4uimmigration.br (5.574 vs 267.206) = barreira para ser percebido como player líder no segmento."
    ],
    "comparativo_concorrentes": [
      {
        "handle": "@d4uimmigration.br",
        "estrategia_que_funciona": "Uso intensivo de Reels (75%) com ganchos de alerta e provas sociais, como 'Antes de contratar qualquer empresa para o seu EB-2 NIW ou EB-1, você precisa parar e analisar alguns pontos essenciais.' — esse tipo de vídeo gerou 1.003 engajamentos em um único post.",
        "como_voce_aplica": "Grave 3 Reels por semana com ganchos de alerta ('O que ninguém te conta sobre cidadania europeia'), sempre com CTA para DM ou link na bio.",
        "ganho_esperado_vendas": "+200 leads/mês em 60 dias, considerando aumento de alcance e conversão similar ao benchmark."
      },
      {
        "handle": "@haymanwoodward",
        "estrategia_que_funciona": "Storytelling de casos reais e conquistas ('Cleiton cresceu numa família de empreendedores no Brasil...'), com vídeos curtos e legendas detalhadas, gerando até 109 engajamentos em posts de depoimento.",
        "como_voce_aplica": "Publique 1 Reel semanal com case real de cliente, focando nos desafios e conquistas no processo de mobilidade.",
        "ganho_esperado_vendas": "+80 leads/mês em 60 dias, ao humanizar a marca e gerar identificação."
      }
    ],
    "caminhos_de_crescimento": [
      {
        "titulo": "Aceleração de Vídeos Curtos",
        "movimento": "Publique 4 Reels por semana, sempre com ganchos de alerta e CTA para DM ou link bio.",
        "porque_funciona": "@d4uimmigration.br gera até 1.003 engajamentos em vídeos com essa estrutura.",
        "impacto_em_vendas": "+200 leads/mês",
        "tempo_para_resultado": "30 dias"
      },
      {
        "titulo": "Storytelling de Casos Reais",
        "movimento": "Grave 1 Reel semanal com depoimento de cliente ou narrativa de superação.",
        "porque_funciona": "@haymanwoodward atinge até 109 engajamentos em vídeos de storytelling.",
        "impacto_em_vendas": "+80 leads/mês",
        "tempo_para_resultado": "30 dias"
      },
      {
        "titulo": "CTAs Claros e Ofertas Diretas",
        "movimento": "Inclua CTA explícito em 100% dos posts (DM, lista VIP, consulta gratuita).",
        "porque_funciona": "@d4uimmigration.br converte via link_bio e @haymanwoodward via consulta gratuita.",
        "impacto_em_vendas": "+15% em conversão de leads por post",
        "tempo_para_resultado": "7 dias"
      }
    ],
    "previsao_resultados": {
      "30_dias": "7.000 seguidores (+1.426), engajamento médio de 25/post, 200 leads captados via Reels e CTAs.",
      "60_dias": "9.000 seguidores, 35 engajamentos/post, 400 leads totais e 30 agendamentos de consultoria.",
      "90_dias": "11.000 seguidores, 50 engajamentos/post, 600 leads totais, R$ 60.000 em vendas de programas premium de mobilidade."
    },
    "carta_para_cliente_markdown": "Paula,\n\nSeu perfil @globalcitizensolutions já transmite autoridade internacional, com uma bio que destaca 15 países e 17 programas — um diferencial inquestionável. O maior ponto forte está no engajamento proporcional: sua taxa de 0.19% supera em 216% a de players como @haymanwoodward, provando que sua base, embora pequena, responde ao conteúdo com interesse genuíno.\n\nNo entanto, o maior gargalo está na ausência de conversas reais e chamadas para ação. Você registra zero comentários por post, enquanto @d4uimmigration.br alcança 8 comentários e converte seguidores em leads com CTAs claros e vídeos de impacto. O gap de seguidores de -97,91% frente ao líder do nicho limita sua percepção de autoridade e restringe o alcance orgânico, reduzindo o potencial de captação de clientes high ticket.\n\nO desafio para a próxima semana é simples e direto: publique 3 Reels com ganchos de alerta (ex: 'O que ninguém te conta sobre cidadania europeia'), sempre finalizando com CTA para DM ou consulta gratuita. Use depoimentos reais ou perguntas que provoquem resposta nos comentários. Monitore as interações e ajuste o roteiro conforme os temas que mais gerarem respostas. O objetivo é dobrar o volume de comentários e captar os primeiros leads por DM já nos próximos 7 dias.\n\nConte comigo para transformar sua presença digital em uma máquina de leads e vendas globais.\n\n— Seu CMO"
  },
  "diretrizes_tecnicas": {
    "tom_de_voz": {
      "personalidade": "Consultivo, confiável, global, objetivo",
      "como_falar": [
        "Fale com clareza e autoridade: 'Veja como garantir sua cidadania europeia sem erros.'",
        "Use dados e fatos: 'Em 2026, 17 programas de residência mudaram as regras.'",
        "Seja direto: 'Evite esses 3 erros que podem travar seu processo.'",
        "Chame o público para ação: 'Comente sua dúvida ou envie DM para análise gratuita.'",
        "Valorize conquistas: 'Mais de 100 clientes conseguiram o passaporte europeu conosco.'"
      ],
      "como_nao_falar": [
        "Evite frases vagas: 'Temos soluções para todos.'",
        "Não use jargão técnico sem explicar: 'Processo CBI D7 sem contexto confunde.'",
        "Não promova promessas milagrosas: 'Cidadania garantida em 30 dias.'",
        "Evite tom distante: 'Se desejar, entre em contato.'"
      ],
      "exemplos_frase_ok": [
        "Descubra agora o passo a passo para conquistar sua residência global.",
        "Veja como evitar as armadilhas mais comuns na busca pelo Golden Visa.",
        "Comente sua principal dúvida sobre cidadania europeia e respondo pessoalmente."
      ],
      "exemplos_frase_evitar": [
        "Oportunidade imperdível só hoje!",
        "Todo mundo pode conseguir, é só querer.",
        "Clique aqui e mude sua vida instantaneamente."
      ]
    },
    "seo_instagram": {
      "palavras_chave_principais": [
        "mobilidade global",
        "cidadania europeia",
        "residência internacional",
        "golden visa",
        "passaporte europeu",
        "imigração",
        "visto de investidor",
        "segundo passaporte"
      ],
      "palavras_chave_secundarias": [
        "consultoria de imigração",
        "programa de cidadania",
        "dupla cidadania",
        "visto digital nomad",
        "plan b internacional",
        "portugal residência"
      ],
      "bio_otimizada": "🌍 Mobilidade global, cidadania e residência em 15 países | Especialistas em Golden Visa e passaporte europeu | Fale agora via DM para análise gratuita",
      "hashtags_fixas": [
        "#mobilidadeglobal",
        "#cidadaniaeuropeia",
        "#residenciainternacional",
        "#goldenvisa",
        "#passaporteeuropeu",
        "#imigracao",
        "#vistodeinvestidor",
        "#segundapassaporte",
        "#consultoriadeimigracao",
        "#planbinternacional"
      ],
      "uso_em_legenda": "Insira a palavra-chave principal no início da legenda e repita pelo menos 1 vez no texto. Inclua palavras-chave secundárias no meio e finalize com 3 hashtags estratégicas no final da legenda."
    },
    "frequencia_publicacao": {
      "posts_por_semana": 5,
      "posts_por_dia": 1,
      "melhor_horario": "12:00",
      "melhores_horarios": [
        "12:00 seg-sex",
        "10:00 fim semana"
      ],
      "dias_de_pico": [
        "segunda",
        "quarta"
      ],
      "distribuicao_formatos": {
        "reels_pct": 60,
        "carrossel_pct": 35,
        "foto_pct": 5
      }
    },
    "pilares_conteudo": [
      {
        "pilar": "Alertas e Atualizações",
        "porcentagem": 30,
        "descricao": "Notícias quentes, mudanças em leis, prazos e oportunidades emergentes de mobilidade global.",
        "exemplo_concorrente": "@d4uimmigration.br — vídeos de alerta e atualização de vistos."
      },
      {
        "pilar": "Cases e Depoimentos",
        "porcentagem": 20,
        "descricao": "Histórias reais de clientes, conquistas e superações no processo de cidadania ou residência.",
        "exemplo_concorrente": "@haymanwoodward — storytelling de clientes."
      },
      {
        "pilar": "Educacional/Passo a Passo",
        "porcentagem": 25,
        "descricao": "Explicações práticas sobre programas, requisitos e processos de imigração.",
        "exemplo_concorrente": "@d4uimmigration.br — carrosséis explicativos."
      },
      {
        "pilar": "Ofertas e Consultorias",
        "porcentagem": 15,
        "descricao": "Convites para consultoria gratuita, lives, webinars e promoções de análise de perfil.",
        "exemplo_concorrente": "@haymanwoodward — CTA para consulta gratuita."
      },
      {
        "pilar": "Bastidores e Autoridade",
        "porcentagem": 10,
        "descricao": "Equipe, bastidores, participação em eventos e validação internacional.",
        "exemplo_concorrente": "@d4uimmigration.br — bastidores do escritório."
      }
    ],
    "assuntos_quentes": [
      "3 erros que travam seu pedido de cidadania europeia em 2026",
      "Como garantir residência em Portugal mesmo com as novas regras",
      "Golden Visa: o que mudou em 2026 e como aproveitar",
      "Diferença entre dupla cidadania e residência internacional",
      "Como escolher o melhor país para seu segundo passaporte",
      "Plan B internacional: por que todo investidor está buscando",
      "Visto de investidor: requisitos e vantagens em 5 países",
      "Digital Nomad Visa: oportunidades e armadilhas",
      "Como funciona o processo de cidadania para filhos menores",
      "Passaporte europeu: mitos e verdades",
      "Consultoria gratuita: o que você precisa saber antes de investir",
      "Depoimento: como conquistei minha residência na Europa",
      "Alertas: mudanças urgentes em vistos para brasileiros",
      "Como evitar fraudes em programas de cidadania",
      "Checklist: documentos obrigatórios para cidadania em 2026"
    ],
    "ideias_de_titulos": [
      "O passo a passo para conquistar sua cidadania europeia em 2026",
      "Golden Visa: como garantir seu futuro fora do Brasil",
      "3 motivos para buscar residência internacional hoje",
      "Como evitar erros fatais no processo de imigração",
      "Plan B internacional: segurança para sua família",
      "Visto de investidor: por onde começar?",
      "Digital Nomad Visa: liberdade e renda global",
      "Meu case: como ajudei clientes a obterem dupla cidadania",
      "Residência em Portugal: o que mudou e como se adaptar",
      "Checklist definitivo para não travar seu processo",
      "Depoimento real: conquistei o passaporte europeu",
      "Consultoria gratuita: tire suas dúvidas agora"
    ],
    "ganchos_modelo": [
      "Você sabia que pode perder sua chance de cidadania por um detalhe?",
      "Antes de investir em qualquer programa, veja isso.",
      "O que ninguém te conta sobre o Golden Visa em 2026.",
      "3 erros que travam 90% dos pedidos de residência.",
      "Descubra como brasileiros estão garantindo o passaporte europeu.",
      "Seu Plan B internacional está pronto?",
      "A verdade sobre o visto de investidor que ninguém fala.",
      "Já pensou em morar legalmente em 2 países?",
      "Veja o que mudou para quem quer cidadania europeia.",
      "Comente sua dúvida e receba análise gratuita."
    ],
    "ctas_recomendados": [
      "Envie DM com sua dúvida e receba análise gratuita.",
      "Clique no link da bio para agendar sua consultoria.",
      "Comente 'QUERO' para receber o checklist exclusivo.",
      "Salve este post para consultar depois.",
      "Compartilhe com alguém que precisa desse alerta.",
      "Participe da nossa live e tire dúvidas ao vivo.",
      "Baixe o e-book gratuito sobre Golden Visa.",
      "Marque um amigo que sonha com residência internacional."
    ],
    "hashtags_estrategicas": {
      "core": [
        "#globalcitizensolutions",
        "#mobilidadeglobal",
        "#cidadaniaeuropeia",
        "#goldenvisa",
        "#residenciainternacional",
        "#segundapassaporte"
      ],
      "rotativas_alto_volume": [
        "#imigracao",
        "#vistodeinvestidor",
        "#digitalnomadvisa",
        "#planbinternacional",
        "#consultoriadeimigracao",
        "#passaporteeuropeu",
        "#portugalresidencia",
        "#cidadaniaportuguesa"
      ],
      "rotativas_nicho": [
        "#expatriados",
        "#investimentoimigratorio",
        "#cidadaniadigital",
        "#vistoportugal",
        "#residenciaglobal",
        "#cidadaniaitaliana",
        "#familianomundo",
        "#planbseguro"
      ],
      "evite": [
        "#fiqueemcasa",
        "#oportunidade",
        "#emagrecer",
        "#brasil",
        "#dicas"
      ]
    },
    "identidade_visual": {
      "paleta_cores": [
        {
          "nome": "Primária",
          "hex": "#003366",
          "uso": "Fundo de posts, títulos, elementos institucionais"
        },
        {
          "nome": "Secundária",
          "hex": "#F2B134",
          "uso": "Destaques, CTAs, detalhes gráficos"
        },
        {
          "nome": "Suporte",
          "hex": "#E5E5E5",
          "uso": "Fundos neutros, áreas de respiro, textos secundários"
        }
      ],
      "tipografia": {
        "display": "Montserrat Bold",
        "texto": "Montserrat Regular",
        "regras_uso": [
          "Títulos com pelo menos 52px em Reels e carrosséis",
          "Contraste alto entre texto e fundo: azul escuro (#003366) com branco ou amarelo"
        ]
      },
      "estilo_fotografico": "Ambientes corporativos, iluminação natural, ângulos frontais e closes, fundo clean ou com bandeiras de países, foco em expressão confiante.",
      "estilo_grafico": "Overlays minimalistas, barras de destaque em amarelo, ícones de passaporte e mapas, animações rápidas de entrada de texto em Reels.",
      "vestimenta_aparicoes": {
        "diretrizes": "Use blazer azul escuro ou cinza, camisa clara, visual sóbrio e internacional. Acessórios discretos.",
        "evitar": [
          "Camiseta estampada",
          "Cores neon",
          "Acessórios chamativos",
          "Ambientes informais"
        ],
        "mood_referencias": [
          "@d4uimmigration.br — institucional global",
          "@haymanwoodward — executivo internacional"
        ]
      },
      "logos_e_marca_dagua": "Inclua logo no canto inferior direito de todos os Reels e carrosséis. Use marca d’água sutil em imagens de depoimentos."
    },
    "stories_recorrentes": [
      {
        "tipo": "Alerta de Mudança",
        "frequencia": "semanal",
        "descricao": "Stories com vídeo curto sobre mudanças urgentes em leis ou prazos. Objetivo: gerar urgência e tráfego para DM."
      },
      {
        "tipo": "Bastidores do Escritório",
        "frequencia": "semanal",
        "descricao": "Mostre equipe, reuniões, validação internacional. Objetivo: humanizar e reforçar autoridade."
      },
      {
        "tipo": "Dica Rápida de Mobilidade",
        "frequencia": "diário",
        "descricao": "Vídeo de até 15s com dica sobre cidadania, visto ou residência. Objetivo: fixar Paula como referência diária."
      },
      {
        "tipo": "Depoimento Real",
        "frequencia": "quinzenal",
        "descricao": "Compartilhe vídeo ou print de mensagem de cliente satisfeito. Objetivo: prova social e credibilidade."
      }
    ],
    "kpis_acompanhar": [
      {
        "kpi": "Seguidores",
        "baseline": "5.574",
        "meta_30d": "7.000",
        "meta_60d": "9.000",
        "meta_90d": "11.000",
        "como_medir": "Instagram Insights — painel de seguidores"
      },
      {
        "kpi": "Engajamento médio por post",
        "baseline": "10",
        "meta_30d": "25",
        "meta_60d": "35",
        "meta_90d": "50",
        "como_medir": "Soma de curtidas+comentários por post"
      },
      {
        "kpi": "Comentários por post",
        "baseline": "0",
        "meta_30d": "5",
        "meta_60d": "10",
        "meta_90d": "15",
        "como_medir": "Instagram Insights — interações"
      },
      {
        "kpi": "Leads captados via DM",
        "baseline": "0",
        "meta_30d": "100",
        "meta_60d": "300",
        "meta_90d": "600",
        "como_medir": "Contagem manual de mensagens iniciadas após CTA"
      },
      {
        "kpi": "Consultorias agendadas",
        "baseline": "0",
        "meta_30d": "10",
        "meta_60d": "30",
        "meta_90d": "60",
        "como_medir": "Calendário de agendamentos"
      }
    ],
    "briefing_redatores": "Estruture roteiros de Reels e carrosséis com abertura de impacto (gancho de até 3s), apresentação do problema, solução prática e CTA claro. Use linguagem consultiva, objetiva e global, evitando jargões e promessas milagrosas. Sempre inicie com uma pergunta ou alerta ('Você sabia que...?'), traga dados do mercado ou mudanças recentes e finalize convidando para DM, comentário ou consulta. Proibido frases vagas, clichês de autoajuda e termos técnicos sem explicação. Exemplo de abertura: 'Antes de investir em cidadania europeia, veja isso.' CTA obrigatório: 'Comente sua dúvida ou envie DM para análise gratuita.'",
    "briefing_designers": "Utilize a paleta institucional (#003366, #F2B134, #E5E5E5) em todos os posts. Títulos devem usar Montserrat Bold, mínimo 52px em Reels/carrosséis. Priorize contraste forte (azul escuro com branco/amarelo). Elementos visuais obrigatórios: barras de destaque amarelas, ícones de passaporte/mapa, logo no canto inferior direito. Proibido usar fundos poluídos, fontes decorativas ou imagens de baixa resolução. Siga referências de @d4uimmigration.br e @haymanwoodward para visual global, institucional e sóbrio. Imagens de pessoas: fundo clean, blazer escuro, iluminação natural.",
    "calendario_30_dias": [
      {
        "dia": 1,
        "dia_semana": "Segunda",
        "formato": "Carrossel",
        "pilar": "Alertas e Atualizações",
        "tema": "3 erros que travam seu pedido de cidadania europeia em 2026",
        "objetivo": "Alcance",
        "origem_do_tema": "plano_diretor",
        "gancho_3s": "Você sabia que pode perder sua chance de cidadania por um detalhe?",
        "estrutura_resumida": "",
        "cta": "Comente sua dúvida ou envie DM para análise gratuita.",
        "hashtags": [],
        "sugestao_legenda": "Cidadania europeia: 3 erros que travam seu pedido em 2026. Se você está buscando cidadania europeia, atenção aos erros mais comuns que podem atrasar ou até impedir seu processo. Em 2026, as regras mudaram e muitos brasileiros estão sendo surpreendidos por detalhes simples. Descubra agora como evitar armadilhas e garantir sua cidadania europeia com segurança. Fique atento às exigências de documentos, prazos e escolha do programa certo. Não arrisque seu futuro por falta de informação. Comente sua dúvida ou envie DM para análise gratuita. #cidadaniaeuropeia #mobilidadeglobal #globalcitizensolutions #imigracao #consultoriadeimigracao #segundapassaporte #passaporteeuropeu #planbinternacional",
        "legenda_completa": "Cidadania europeia: 3 erros que travam seu pedido em 2026. Se você está buscando cidadania europeia, atenção aos erros mais comuns que podem atrasar ou até impedir seu processo. Em 2026, as regras mudaram e muitos brasileiros estão sendo surpreendidos por detalhes simples. Descubra agora como evitar armadilhas e garantir sua cidadania europeia com segurança. Fique atento às exigências de documentos, prazos e escolha do programa certo. Não arrisque seu futuro por falta de informação. Comente sua dúvida ou envie DM para análise gratuita. #cidadaniaeuropeia #mobilidadeglobal #globalcitizensolutions #imigracao #consultoriadeimigracao #segundapassaporte #passaporteeuropeu #planbinternacional",
        "slides_carrossel": {
          "slide_capa": {
            "titulo": "3 erros que travam seu pedido de cidadania europeia em 2026",
            "visual_sugerido": "Imagem de um passaporte europeu com um grande X vermelho e fundo sóbrio"
          },
          "slides": [
            {
              "numero": 1,
              "titulo": "Erro 1: Documentação incompleta",
              "conteudo_principal": "Muitos processos são negados por documentos faltando ou fora do padrão exigido. Revise cada item antes de enviar.",
              "visual_sugerido": "Checklist de documentos com alguns itens destacados em vermelho"
            },
            {
              "numero": 2,
              "titulo": "Erro 2: Não acompanhar mudanças na lei",
              "conteudo_principal": "As regras para cidadania europeia mudaram em 2026. Fique atento às atualizações para não ser pego de surpresa.",
              "visual_sugerido": "Ícone de calendário com alerta e uma lei sendo atualizada"
            },
            {
              "numero": 3,
              "titulo": "Erro 3: Escolher o programa errado",
              "conteudo_principal": "Cada país tem regras e programas diferentes. Escolher mal pode atrasar ou impedir seu processo.",
              "visual_sugerido": "Mapa da Europa com setas apontando para diferentes países"
            },
            {
              "numero": 4,
              "titulo": "Dica Extra: Consulte um especialista",
              "conteudo_principal": "Uma consultoria de imigração evita erros e aumenta suas chances de sucesso.",
              "visual_sugerido": "Pessoa conversando com consultor, papéis sobre a mesa"
            },
            {
              "numero": 5,
              "titulo": "Atenção aos prazos",
              "conteudo_principal": "Perder prazos pode significar começar tudo de novo. Programe-se e acompanhe cada etapa.",
              "visual_sugerido": "Relógio e calendário marcando datas importantes"
            },
            {
              "numero": 6,
              "titulo": "Não caia em promessas milagrosas",
              "conteudo_principal": "Desconfie de ofertas de cidadania garantida em poucos dias. Procure empresas sérias.",
              "visual_sugerido": "Selo de alerta e texto: 'Cuidado com fraudes!'"
            }
          ],
          "slide_final": {
            "cta": "Comente sua dúvida ou envie DM para análise gratuita.",
            "visual_sugerido": "Imagem de mão segurando um passaporte europeu e call to action em destaque"
          },
          "qtd_slides": 7
        },
        "foto_detalhes": null,
        "_gpt_gerado": true
      },
      {
        "dia": 2,
        "dia_semana": "Terça",
        "formato": "Foto",
        "pilar": "Bastidores e Autoridade",
        "tema": "Equipe Global Citizen Solutions em evento internacional de mobilidade global",
        "objetivo": "Engajamento",
        "origem_do_tema": "plano_diretor",
        "gancho_3s": "Veja como nossa equipe se mantém à frente das tendências globais.",
        "estrutura_resumida": "",
        "cta": "Salve este post para conhecer quem está por trás do seu processo.",
        "hashtags": [],
        "sugestao_legenda": "Mobilidade global: nossa equipe marca presença em evento internacional. Estar atualizado é essencial para oferecer as melhores soluções em mobilidade global. Nossa equipe participou do principal evento do setor, trazendo novidades e estratégias para nossos clientes. Conheça quem está por trás do seu processo e confie em quem entende do assunto. Salve este post para conhecer quem está por trás do seu processo. #mobilidadeglobal #globalcitizensolutions #bastidores #autoridade #consultoriadeimigracao #expatriados #residenciaglobal #planbinternacional",
        "legenda_completa": "Mobilidade global: nossa equipe marca presença em evento internacional. Estar atualizado é essencial para oferecer as melhores soluções em mobilidade global. Nossa equipe participou do principal evento do setor, trazendo novidades e estratégias para nossos clientes. Conheça quem está por trás do seu processo e confie em quem entende do assunto. Salve este post para conhecer quem está por trás do seu processo. #mobilidadeglobal #globalcitizensolutions #bastidores #autoridade #consultoriadeimigracao #expatriados #residenciaglobal #planbinternacional",
        "slides_carrossel": null,
        "foto_detalhes": {
          "descricao_imagem": "Equipe reunida em evento internacional, com crachás e painel de fundo com logotipo do evento",
          "texto_overlay": "Presença Global",
          "mood": "Profissional, iluminação natural, paleta azul e branco, enquadramento horizontal mostrando todos os membros"
        },
        "_gpt_gerado": true
      },
      {
        "dia": 3,
        "dia_semana": "Quarta",
        "formato": "Carrossel",
        "pilar": "Educacional/Passo a Passo",
        "tema": "Golden Visa: o que mudou em 2026 e como aproveitar",
        "objetivo": "Alcance",
        "origem_do_tema": "plano_diretor",
        "gancho_3s": "O que ninguém te conta sobre o Golden Visa em 2026.",
        "estrutura_resumida": "",
        "cta": "Salve este post e compartilhe com quem busca o Golden Visa.",
        "hashtags": [],
        "sugestao_legenda": "Golden Visa: entenda as mudanças de 2026 e como aproveitar. O programa Golden Visa passou por atualizações importantes este ano. Veja como garantir sua residência internacional, evitar armadilhas e aproveitar as novas oportunidades. Descubra os requisitos atualizados, países mais vantajosos e dicas para acelerar seu processo. Salve este post e compartilhe com quem busca o Golden Visa. #goldenvisa #mobilidadeglobal #residenciainternacional #vistodeinvestidor #planbinternacional #consultoriadeimigracao #expatriados #imigracao",
        "legenda_completa": "Golden Visa: entenda as mudanças de 2026 e como aproveitar. O programa Golden Visa passou por atualizações importantes este ano. Veja como garantir sua residência internacional, evitar armadilhas e aproveitar as novas oportunidades. Descubra os requisitos atualizados, países mais vantajosos e dicas para acelerar seu processo. Salve este post e compartilhe com quem busca o Golden Visa. #goldenvisa #mobilidadeglobal #residenciainternacional #vistodeinvestidor #planbinternacional #consultoriadeimigracao #expatriados #imigracao",
        "slides_carrossel": {
          "slide_capa": {
            "titulo": "Golden Visa: o que mudou em 2026",
            "visual_sugerido": "Imagem de passaportes de diferentes países e selo 'Atualizado 2026'"
          },
          "slides": [
            {
              "numero": 1,
              "titulo": "O que é o Golden Visa?",
              "conteudo_principal": "É um programa de residência para investidores, disponível em vários países europeus. Permite morar, estudar e trabalhar legalmente.",
              "visual_sugerido": "Gráfico simples mostrando benefícios do Golden Visa"
            },
            {
              "numero": 2,
              "titulo": "Principais mudanças em 2026",
              "conteudo_principal": "Novos valores mínimos de investimento, restrições em imóveis e maior exigência de comprovação de renda.",
              "visual_sugerido": "Tabela comparando regras antigas e novas"
            },
            {
              "numero": 3,
              "titulo": "Países mais vantajosos",
              "conteudo_principal": "Portugal, Espanha e Grécia continuam liderando, mas Malta e Itália ganharam destaque com novas condições.",
              "visual_sugerido": "Mapa da Europa com países destacados"
            },
            {
              "numero": 4,
              "titulo": "Dicas para acelerar o processo",
              "conteudo_principal": "Prepare toda documentação com antecedência e conte com consultoria especializada para evitar erros.",
              "visual_sugerido": "Checklist e ícone de consultoria"
            },
            {
              "numero": 5,
              "titulo": "Evite armadilhas comuns",
              "conteudo_principal": "Desconfie de promessas de aprovação rápida. Siga canais oficiais e busque referências.",
              "visual_sugerido": "Ícone de alerta e selo de autenticidade"
            }
          ],
          "slide_final": {
            "cta": "Salve este post e compartilhe com quem busca o Golden Visa.",
            "visual_sugerido": "Imagem de passaporte e call to action em destaque"
          },
          "qtd_slides": 6
        },
        "foto_detalhes": null,
        "_gpt_gerado": true
      },
      {
        "dia": 4,
        "dia_semana": "Quinta",
        "formato": "Foto",
        "pilar": "Cases e Depoimentos",
        "tema": "Depoimento: como conquistei minha residência na Europa",
        "objetivo": "Engajamento",
        "origem_do_tema": "plano_diretor",
        "gancho_3s": "Veja como brasileiros estão garantindo o passaporte europeu.",
        "estrutura_resumida": "",
        "cta": "Comente sua dúvida ou envie DM para análise gratuita.",
        "hashtags": [],
        "sugestao_legenda": "Residência internacional: conheça o depoimento de quem conquistou o sonho europeu. A mobilidade global é possível para quem se prepara e segue o caminho certo. Veja como nosso cliente superou desafios e garantiu sua residência na Europa. Inspire-se e tire suas dúvidas nos comentários ou envie DM para análise gratuita. #residenciainternacional #cidadaniaeuropeia #mobilidadeglobal #expatriados #segundapassaporte #globalcitizensolutions #consultoriadeimigracao #familianomundo",
        "legenda_completa": "Residência internacional: conheça o depoimento de quem conquistou o sonho europeu. A mobilidade global é possível para quem se prepara e segue o caminho certo. Veja como nosso cliente superou desafios e garantiu sua residência na Europa. Inspire-se e tire suas dúvidas nos comentários ou envie DM para análise gratuita. #residenciainternacional #cidadaniaeuropeia #mobilidadeglobal #expatriados #segundapassaporte #globalcitizensolutions #consultoriadeimigracao #familianomundo",
        "slides_carrossel": null,
        "foto_detalhes": {
          "descricao_imagem": "Pessoa sorrindo segurando passaporte europeu, fundo de cidade europeia clássica",
          "texto_overlay": "Conquista Real",
          "mood": "Inspirador, iluminação quente, paleta de tons terrosos, enquadramento vertical próximo ao rosto"
        },
        "_gpt_gerado": true
      },
      {
        "dia": 5,
        "dia_semana": "Sexta",
        "formato": "Carrossel",
        "pilar": "Educacional/Passo a Passo",
        "tema": "Checklist definitivo para não travar seu processo de cidadania em 2026",
        "objetivo": "Engajamento",
        "origem_do_tema": "plano_diretor",
        "gancho_3s": "Antes de investir em qualquer programa, veja isso.",
        "estrutura_resumida": "",
        "cta": "Comente 'QUERO' para receber o checklist exclusivo.",
        "hashtags": [],
        "sugestao_legenda": "Cidadania europeia: checklist definitivo para 2026. Não corra riscos no seu processo de cidadania europeia. Use este checklist para garantir que nada vai travar sua aprovação. Confira documentos, prazos, taxas e detalhes que fazem a diferença. Comente 'QUERO' para receber o checklist exclusivo. #cidadaniaeuropeia #mobilidadeglobal #segundapassaporte #consultoriadeimigracao #passaporteeuropeu #planbinternacional #expatriados #documentos",
        "legenda_completa": "Cidadania europeia: checklist definitivo para 2026. Não corra riscos no seu processo de cidadania europeia. Use este checklist para garantir que nada vai travar sua aprovação. Confira documentos, prazos, taxas e detalhes que fazem a diferença. Comente 'QUERO' para receber o checklist exclusivo. #cidadaniaeuropeia #mobilidadeglobal #segundapassaporte #consultoriadeimigracao #passaporteeuropeu #planbinternacional #expatriados #documentos",
        "slides_carrossel": {
          "slide_capa": {
            "titulo": "Checklist definitivo para cidadania em 2026",
            "visual_sugerido": "Imagem de checklist com passaporte europeu ao lado"
          },
          "slides": [
            {
              "numero": 1,
              "titulo": "1. Documentação básica",
              "conteudo_principal": "RG, CPF, certidões de nascimento, casamento e antecedentes criminais atualizados.",
              "visual_sugerido": "Ícones de documentos empilhados"
            },
            {
              "numero": 2,
              "titulo": "2. Traduções juramentadas",
              "conteudo_principal": "Verifique se todos os documentos estão traduzidos conforme exigência do país.",
              "visual_sugerido": "Documento com selo de tradução"
            },
            {
              "numero": 3,
              "titulo": "3. Apostilamento de Haia",
              "conteudo_principal": "Todos os documentos internacionais devem estar apostilados.",
              "visual_sugerido": "Selo de Haia em destaque"
            },
            {
              "numero": 4,
              "titulo": "4. Comprovantes de residência e renda",
              "conteudo_principal": "Tenha comprovantes recentes e compatíveis com as exigências do programa.",
              "visual_sugerido": "Ícone de casa e extrato bancário"
            },
            {
              "numero": 5,
              "titulo": "5. Pagamento de taxas",
              "conteudo_principal": "Confirme valores atualizados e mantenha comprovantes de pagamento.",
              "visual_sugerido": "Ícone de recibo e cartão"
            },
            {
              "numero": 6,
              "titulo": "6. Prazo de validade dos documentos",
              "conteudo_principal": "Documentos vencidos são motivo de indeferimento. Sempre cheque a validade.",
              "visual_sugerido": "Relógio marcando tempo e documentos ao fundo"
            }
          ],
          "slide_final": {
            "cta": "Comente 'QUERO' para receber o checklist exclusivo.",
            "visual_sugerido": "Checklist completo com selo de aprovado"
          },
          "qtd_slides": 7
        },
        "foto_detalhes": null,
        "_gpt_gerado": true
      },
      {
        "dia": 6,
        "dia_semana": "Sábado",
        "formato": "Carrossel",
        "pilar": "Ofertas e Consultorias",
        "tema": "Consultoria gratuita: o que você precisa saber antes de investir",
        "objetivo": "Conversão",
        "origem_do_tema": "plano_diretor",
        "gancho_3s": "Antes de investir em cidadania europeia, veja isso.",
        "estrutura_resumida": "",
        "cta": "Clique no link da bio para agendar sua consultoria.",
        "hashtags": [],
        "sugestao_legenda": "Consultoria de imigração: saiba como funciona e o que analisar antes de investir. Uma consultoria especializada pode evitar prejuízos e acelerar seu processo de mobilidade global. Veja o que considerar antes de escolher um parceiro para o seu projeto internacional. Clique no link da bio para agendar sua consultoria. #consultoriadeimigracao #mobilidadeglobal #cidadaniaeuropeia #residenciainternacional #planbinternacional #vistodeinvestidor #expatriados #globalcitizensolutions",
        "legenda_completa": "Consultoria de imigração: saiba como funciona e o que analisar antes de investir. Uma consultoria especializada pode evitar prejuízos e acelerar seu processo de mobilidade global. Veja o que considerar antes de escolher um parceiro para o seu projeto internacional. Clique no link da bio para agendar sua consultoria. #consultoriadeimigracao #mobilidadeglobal #cidadaniaeuropeia #residenciainternacional #planbinternacional #vistodeinvestidor #expatriados #globalcitizensolutions",
        "slides_carrossel": {
          "slide_capa": {
            "titulo": "Consultoria gratuita: o que saber antes de investir",
            "visual_sugerido": "Imagem de duas pessoas em reunião, papéis e laptop na mesa"
          },
          "slides": [
            {
              "numero": 1,
              "titulo": "Por que fazer consultoria?",
              "conteudo_principal": "Evita erros, reduz riscos e traz informações atualizadas sobre programas e documentos.",
              "visual_sugerido": "Ícone de escudo e pessoa com checklists"
            },
            {
              "numero": 2,
              "titulo": "Como funciona a análise gratuita?",
              "conteudo_principal": "Você envia suas dúvidas e recebe um diagnóstico inicial sem custo.",
              "visual_sugerido": "Mensagem de celular e símbolo de gratuito"
            },
            {
              "numero": 3,
              "titulo": "O que considerar ao escolher uma consultoria?",
              "conteudo_principal": "Verifique experiência, avaliações de clientes e transparência nos processos.",
              "visual_sugerido": "Estrelas de avaliação e depoimento de cliente"
            },
            {
              "numero": 4,
              "titulo": "Principais benefícios",
              "conteudo_principal": "Acesso a informações seguras, acompanhamento personalizado e economia de tempo.",
              "visual_sugerido": "Relógio, gráfico de crescimento e símbolo de suporte"
            }
          ],
          "slide_final": {
            "cta": "Clique no link da bio para agendar sua consultoria.",
            "visual_sugerido": "Botão de agendamento e logo da empresa"
          },
          "qtd_slides": 5
        },
        "foto_detalhes": null,
        "_gpt_gerado": true
      },
      {
        "dia": 7,
        "dia_semana": "Domingo",
        "formato": "Foto",
        "pilar": "Ofertas e Consultorias",
        "tema": "Plan B internacional: por que todo investidor está buscando",
        "objetivo": "Conversão",
        "origem_do_tema": "plano_diretor",
        "gancho_3s": "Seu Plan B internacional está pronto?",
        "estrutura_resumida": "",
        "cta": "Envie DM com sua dúvida e receba análise gratuita.",
        "hashtags": [],
        "sugestao_legenda": "Mobilidade global: descubra por que o Plan B internacional é prioridade para investidores em 2026. Ter um segundo passaporte ou residência internacional é sinônimo de segurança, liberdade e novas oportunidades. Não fique para trás: envie DM com sua dúvida e receba análise gratuita. #mobilidadeglobal #segundapassaporte #planbinternacional #cidadaniaeuropeia #residenciainternacional #vistodeinvestidor #globalcitizensolutions #expatriados",
        "legenda_completa": "Mobilidade global: descubra por que o Plan B internacional é prioridade para investidores em 2026. Ter um segundo passaporte ou residência internacional é sinônimo de segurança, liberdade e novas oportunidades. Não fique para trás: envie DM com sua dúvida e receba análise gratuita. #mobilidadeglobal #segundapassaporte #planbinternacional #cidadaniaeuropeia #residenciainternacional #vistodeinvestidor #globalcitizensolutions #expatriados",
        "slides_carrossel": null,
        "foto_detalhes": {
          "descricao_imagem": "Close em mãos segurando dois passaportes diferentes, fundo neutro e elegante",
          "texto_overlay": "Plan B Internacional",
          "mood": "Sofisticado, iluminação suave, paleta azul escuro e dourado, foco nos passaportes"
        },
        "_gpt_gerado": true
      }
    ]
  }
};
