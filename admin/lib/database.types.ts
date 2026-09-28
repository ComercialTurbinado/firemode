/**
 * Tipos do Supabase — projeto original Firemode (mblntoimrkfoocbztozb)
 *
 * Atualizar com `npm run db:types` quando o CLI estiver linkado
 * (`npm run db:link` + access token). Até lá, shapes inferidos do admin.
 *
 * Teleprompter (clients/sessions) usa outro projeto — ver lib/teleprompter.ts.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableDef<
  Row extends Record<string, unknown>,
  Insert extends Record<string, unknown> = Partial<Row> & Record<string, unknown>,
  Update extends Record<string, unknown> = Partial<Row>,
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      analises: TableDef<{
        id: string;
        cliente_handle: string | null;
        handle_auditado: string;
        tipo_auditoria: string;
        status_auditoria: string | null;
        nicho: string | null;
        seguidores: number | null;
        taxa_engajamento: number | null;
        qtd_posts: number | null;
        criado_em: string;
      }>;

      analises_web: TableDef<{
        id: string;
        cliente_handle: string | null;
        url: string;
        dominio: string | null;
        status: string;
        diagnostico: Record<string, unknown> | null;
        presenca: Record<string, unknown> | null;
        etapas: Record<string, unknown> | null;
        criado_em: string;
      }>;

      apresentacao_interesses: TableDef<{
        id: string;
        analise_web_id: string;
        canal_id: string;
        canal_label: string;
        session_key: string;
        marcado: boolean;
        atualizado_em: string;
      }>;

      apresentacao_propostas: TableDef<{
        id: string;
        analise_web_id: string;
        modo: string;
        canais: unknown;
        session_key: string;
        criado_em: string;
      }>;

      cliente_concorrentes: TableDef<{
        cliente_handle: string;
        concorrente_handle: string;
        criado_em: string;
      }>;

      clientes: TableDef<{
        handle: string;
        nome_completo: string | null;
        whatsapp: string | null;
        email: string | null;
        nicho: string | null;
        username: string | null;
        plano: string;
        status: string;
        criado_em: string;
        atualizado_em: string;
      }>;

      presenca_auto_config: TableDef<{
        cliente_handle: string;
        ativo: boolean;
        intervalo_dias: number;
        ultima_verificacao_em: string | null;
        ultimo_job_id: string | null;
        ultimo_delta: Record<string, unknown> | null;
        criado_em: string;
        atualizado_em: string;
      }>;

      concorrentes: TableDef<{
        handle: string;
        nome_completo: string | null;
        site_externo: string | null;
      }>;

      concorrentes_web: TableDef<{
        id: string;
        analise_web_id: string;
        dominio: string | null;
        nome: string | null;
        tipo: string;
        aparicoes: number;
        fora_da_serp: boolean | null;
        porque: string | null;
        ranqueia_para: string[] | null;
        fonte: string[] | null;
        status: string | null;
        handles: Record<string, unknown> | null;
        meta_extra: Record<string, unknown> | null;
      }>;

      creditos_clientes: TableDef<{
        cliente_handle: string;
        saldo_atual: number;
        creditos_mes: number;
        total_consumido: number;
        total_recarregado: number;
      }>;

      features_creditos: TableDef<{
        slug: string;
        nome: string;
        descricao: string | null;
        custo_creditos: number;
        categoria: string | null;
        ativo: boolean;
      }>;

      leads: TableDef<{
        id: number;
        nome: string;
        empresa: string | null;
        whatsapp: string | null;
        instagram: string | null;
        cupom_utilizado: string | null;
        created_at: string;
      }>;

      lp_presenca_conversas: {
        Row: {
          id: string;
          whatsapp_digits: string;
          nome: string;
          email: string;
          presence: string | null;
          messages: unknown;
          phase: string;
          follow_up_status: "active" | "closed_won" | "closed_lost" | "opted_out";
          follow_up_count: number;
          next_follow_up_at: string | null;
          last_message_at: string;
          is_cliente: boolean;
          expires_at: string;
          browser_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          whatsapp_digits: string;
          nome: string;
          email: string;
          presence?: string | null;
          messages?: unknown;
          phase?: string;
          follow_up_status?: "active" | "closed_won" | "closed_lost" | "opted_out";
          follow_up_count?: number;
          next_follow_up_at?: string | null;
          last_message_at?: string;
          is_cliente?: boolean;
          expires_at: string;
          browser_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          whatsapp_digits?: string;
          nome?: string;
          email?: string;
          presence?: string | null;
          messages?: unknown;
          phase?: string;
          follow_up_status?: "active" | "closed_won" | "closed_lost" | "opted_out";
          follow_up_count?: number;
          next_follow_up_at?: string | null;
          last_message_at?: string;
          is_cliente?: boolean;
          expires_at?: string;
          browser_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      crm_funis: TableDef<{
        id: string; nome: string; descricao: string | null; ativo: boolean;
        padrao: boolean; criado_em: string; atualizado_em: string;
      }>;

      crm_etapas: TableDef<{
        id: string; funil_id: string; nome: string; cor: string; ordem: number;
        tipo: "aberta" | "ganha" | "perdida"; criado_em: string;
      }>;

      crm_contatos: TableDef<{
        id: string; nome: string; email: string | null; whatsapp: string | null;
        empresa: string | null; cargo: string | null; site: string | null;
        origem: string; responsavel: string | null; tags: string[];
        observacoes: string | null; aceita_email: boolean;
        criado_em: string; atualizado_em: string;
      }>;

      crm_negocios: TableDef<{
        id: string; contato_id: string; funil_id: string; etapa_id: string;
        titulo: string; produto: string; valor: number; probabilidade: number;
        status: "aberto" | "ganho" | "perdido"; proxima_acao: string | null;
        proxima_acao_em: string | null; motivo_perda: string | null;
        criado_em: string; atualizado_em: string;
      }>;

      crm_atividades: TableDef<{
        id: string; contato_id: string | null; negocio_id: string | null;
        tipo: "nota" | "email" | "ligacao" | "whatsapp" | "reuniao" | "tarefa" | "mudanca_etapa";
        titulo: string; descricao: string | null; vencimento_em: string | null;
        concluida: boolean; metadata: Record<string, unknown>; criado_em: string;
      }>;

      crm_emails: TableDef<{
        id: string; contato_id: string | null; negocio_id: string | null;
        direcao: "entrada" | "saida"; status: "fila" | "enviado" | "recebido" | "falhou";
        de_email: string; de_nome: string | null; para_email: string; assunto: string;
        corpo_texto: string | null; corpo_html: string | null; mailgun_id: string | null;
        message_id: string | null; in_reply_to: string | null; thread_key: string;
        lido: boolean; criado_em: string;
      }>;

      crm_cadencias: TableDef<{
        id: string; nome: string; objetivo: string | null; ativo: boolean;
        criado_em: string; atualizado_em: string;
      }>;

      crm_cadencia_etapas: TableDef<{
        id: string; cadencia_id: string; ordem: number; atraso_dias: number;
        canal: "email" | "whatsapp" | "ligacao" | "tarefa";
        assunto: string | null; corpo: string; criado_em: string;
      }>;

      crm_cadencia_inscricoes: TableDef<{
        id: string; cadencia_id: string; contato_id: string; negocio_id: string | null;
        status: "ativa" | "pausada" | "concluida" | "cancelada" | "respondeu";
        etapa_atual: number; proximo_envio_em: string | null;
        criado_em: string; atualizado_em: string;
      }>;

      pautas_seo: TableDef<{
        id: string;
        analise_web_id: string;
        cliente_handle: string | null;
        titulo: string;
        palavra_chave: string | null;
        intencao: string | null;
        dificuldade: string | null;
        prioridade: number | null;
        lacuna: string | null;
        status: string;
        criado_em: string;
      }>;

      pecas_conteudo: TableDef<{
        id: string;
        analise_ref: string | null;
        cliente_handle: string | null;
        tipo: string;
        status: string;
        titulo: string | null;
        palavra_chave: string | null;
        plataforma: string | null;
        angulo: string | null;
        cunho: string | null;
        etapa_funil: string | null;
        artigo_ref: string | null;
        lote_id: string | null;
        origem: string | null;
        payload: Record<string, unknown> | null;
        validacao: Record<string, unknown> | null;
        criado_em: string;
      }>;

      planos: TableDef<{
        slug: string;
        nome: string;
        preco_mensal: number;
        creditos_mes: number;
        preco_credito_extra: number;
        max_contas: number;
        edicao_video: boolean;
        relatorio_mensal: boolean;
        alertas_diarios: boolean;
        descricao: string | null;
        ativo: boolean;
      }>;

      planos_diretores: TableDef<{
        id: string;
        analise_id: string | null;
        cliente_handle: string;
        diagnostico_identidade: string | null;
        posicionamento_atual: string | null;
        pontos_fortes: string[] | null;
        pontos_fracos: string[] | null;
        carta_para_cliente: string | null;
        previsao_30_dias: string | null;
        previsao_60_dias: string | null;
        previsao_90_dias: string | null;
        caminhos_crescimento: unknown;
        comparativo_concorrentes: unknown;
        tom_de_voz: string | Record<string, unknown> | null;
        seo_instagram: Record<string, unknown> | null;
        frequencia_publicacao: Record<string, unknown> | null;
        pilares_conteudo: string | string[] | unknown[] | null;
        assuntos_quentes: string[] | null;
        ideias_titulos: string[] | null;
        ganchos_modelo: string[] | null;
        ctas_recomendados: string[] | null;
        hashtags_estrategicas: Record<string, unknown> | null;
        identidade_visual: Record<string, unknown> | null;
        stories_recorrentes: unknown;
        kpis_acompanhar: unknown;
        briefing_redatores: string | null;
        briefing_designers: string | null;
        calendario_30_dias: unknown;
        criado_em: string;
      }>;

      roteiros_virais: TableDef<{
        id: string;
        cliente_handle: string;
        roteiros: { titulo?: string; gancho?: string }[] | null;
        criado_em: string;
      }>;

      solicitacoes_auditoria: TableDef<{
        id: string;
        cliente_handle: string;
        handle_principal: string;
        tipo_auditoria: string;
        status: string;
        criado_em: string;
      }>;

      transacoes_creditos: TableDef<{
        id: string;
        cliente_handle: string;
        tipo: string;
        feature_slug: string | null;
        quantidade: number;
        saldo_apos: number;
        descricao: string | null;
        criado_em: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      ajustar_creditos_manual: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
      debitar_creditos_teleprompter: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type LpPresencaConversa =
  Database["public"]["Tables"]["lp_presenca_conversas"]["Row"];

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
