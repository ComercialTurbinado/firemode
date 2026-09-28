export type CrmFunnel = {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  padrao: boolean;
  criado_em: string;
  atualizado_em: string;
};

export type CrmStage = {
  id: string;
  funil_id: string;
  nome: string;
  cor: string;
  ordem: number;
  tipo: "aberta" | "ganha" | "perdida";
  criado_em: string;
};

export type CrmContact = {
  id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  empresa: string | null;
  cargo: string | null;
  site: string | null;
  origem: string;
  responsavel: string | null;
  tags: string[];
  observacoes: string | null;
  aceita_email: boolean;
  criado_em: string;
  atualizado_em: string;
};

export type CrmDeal = {
  id: string;
  contato_id: string;
  funil_id: string;
  etapa_id: string;
  titulo: string;
  produto: string;
  valor: number;
  probabilidade: number;
  status: "aberto" | "ganho" | "perdido";
  proxima_acao: string | null;
  proxima_acao_em: string | null;
  motivo_perda: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type CrmActivity = {
  id: string;
  contato_id: string | null;
  negocio_id: string | null;
  tipo: "nota" | "email" | "ligacao" | "whatsapp" | "reuniao" | "tarefa" | "mudanca_etapa";
  titulo: string;
  descricao: string | null;
  vencimento_em: string | null;
  concluida: boolean;
  metadata: Record<string, unknown>;
  criado_em: string;
};

export type CrmEmail = {
  id: string;
  contato_id: string | null;
  negocio_id: string | null;
  direcao: "entrada" | "saida";
  status: "fila" | "enviado" | "recebido" | "falhou";
  de_email: string;
  de_nome: string | null;
  para_email: string;
  assunto: string;
  corpo_texto: string | null;
  corpo_html: string | null;
  mailgun_id: string | null;
  message_id: string | null;
  in_reply_to: string | null;
  thread_key: string;
  lido: boolean;
  criado_em: string;
};

export type CrmSequence = {
  id: string;
  nome: string;
  objetivo: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
};

export type CrmSequenceStep = {
  id: string;
  cadencia_id: string;
  ordem: number;
  atraso_dias: number;
  canal: "email" | "whatsapp" | "ligacao" | "tarefa";
  assunto: string | null;
  corpo: string;
  criado_em: string;
};

export type CrmEnrollment = {
  id: string;
  cadencia_id: string;
  contato_id: string;
  negocio_id: string | null;
  status: "ativa" | "pausada" | "concluida" | "cancelada" | "respondeu";
  etapa_atual: number;
  proximo_envio_em: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type CommercialSnapshot = {
  capturedAt: string;
  funnels: CrmFunnel[];
  stages: CrmStage[];
  contacts: CrmContact[];
  deals: CrmDeal[];
  activities: CrmActivity[];
  emails: CrmEmail[];
  sequences: CrmSequence[];
  sequenceSteps: CrmSequenceStep[];
  enrollments: CrmEnrollment[];
  setupRequired: boolean;
  mailgunConfigured: boolean;
  mailgunMissing: string[];
};
