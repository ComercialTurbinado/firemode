-- CRM comercial Firemode: funis, contatos, oportunidades, atividades, e-mail e cadencias.
-- Tabelas acessadas apenas pelo backend com service_role.

create extension if not exists pgcrypto;

create table if not exists public.crm_funis (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  ativo boolean not null default true,
  padrao boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create unique index if not exists crm_funis_nome_uidx on public.crm_funis (lower(nome));

create table if not exists public.crm_etapas (
  id uuid primary key default gen_random_uuid(),
  funil_id uuid not null references public.crm_funis(id) on delete cascade,
  nome text not null,
  cor text not null default '#64748b',
  ordem integer not null default 0,
  tipo text not null default 'aberta' check (tipo in ('aberta', 'ganha', 'perdida')),
  criado_em timestamptz not null default now()
);

create unique index if not exists crm_etapas_funil_ordem_uidx
  on public.crm_etapas (funil_id, ordem);

create table if not exists public.crm_contatos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  whatsapp text,
  empresa text,
  cargo text,
  site text,
  origem text not null default 'manual',
  responsavel text,
  tags text[] not null default '{}',
  observacoes text,
  aceita_email boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint crm_contatos_email_check check (email is null or position('@' in email) > 1)
);

create unique index if not exists crm_contatos_email_uidx
  on public.crm_contatos (lower(email)) where email is not null;
create index if not exists crm_contatos_empresa_idx on public.crm_contatos (empresa);

create table if not exists public.crm_negocios (
  id uuid primary key default gen_random_uuid(),
  contato_id uuid not null references public.crm_contatos(id) on delete cascade,
  funil_id uuid not null references public.crm_funis(id) on delete restrict,
  etapa_id uuid not null references public.crm_etapas(id) on delete restrict,
  titulo text not null,
  produto text not null default 'Sprint Presenca',
  valor numeric(12,2) not null default 3900,
  probabilidade integer not null default 20 check (probabilidade between 0 and 100),
  status text not null default 'aberto' check (status in ('aberto', 'ganho', 'perdido')),
  proxima_acao text,
  proxima_acao_em timestamptz,
  motivo_perda text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists crm_negocios_etapa_idx on public.crm_negocios (etapa_id, atualizado_em desc);
create index if not exists crm_negocios_contato_idx on public.crm_negocios (contato_id);

create table if not exists public.crm_atividades (
  id uuid primary key default gen_random_uuid(),
  contato_id uuid references public.crm_contatos(id) on delete cascade,
  negocio_id uuid references public.crm_negocios(id) on delete cascade,
  tipo text not null check (tipo in ('nota', 'email', 'ligacao', 'whatsapp', 'reuniao', 'tarefa', 'mudanca_etapa')),
  titulo text not null,
  descricao text,
  vencimento_em timestamptz,
  concluida boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

create index if not exists crm_atividades_contato_idx on public.crm_atividades (contato_id, criado_em desc);
create index if not exists crm_atividades_pendentes_idx
  on public.crm_atividades (vencimento_em) where concluida = false;

create table if not exists public.crm_emails (
  id uuid primary key default gen_random_uuid(),
  contato_id uuid references public.crm_contatos(id) on delete set null,
  negocio_id uuid references public.crm_negocios(id) on delete set null,
  direcao text not null check (direcao in ('entrada', 'saida')),
  status text not null check (status in ('fila', 'enviado', 'recebido', 'falhou')),
  de_email text not null,
  de_nome text,
  para_email text not null,
  assunto text not null default '',
  corpo_texto text,
  corpo_html text,
  mailgun_id text,
  message_id text,
  in_reply_to text,
  thread_key text not null,
  lido boolean not null default false,
  criado_em timestamptz not null default now()
);

create index if not exists crm_emails_criado_idx on public.crm_emails (criado_em desc);
create index if not exists crm_emails_thread_idx on public.crm_emails (thread_key, criado_em);
create unique index if not exists crm_emails_mailgun_uidx
  on public.crm_emails (mailgun_id) where mailgun_id is not null;

create table if not exists public.crm_cadencias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  objetivo text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.crm_cadencia_etapas (
  id uuid primary key default gen_random_uuid(),
  cadencia_id uuid not null references public.crm_cadencias(id) on delete cascade,
  ordem integer not null,
  atraso_dias integer not null default 0 check (atraso_dias >= 0),
  canal text not null default 'email' check (canal in ('email', 'whatsapp', 'ligacao', 'tarefa')),
  assunto text,
  corpo text not null,
  criado_em timestamptz not null default now(),
  unique (cadencia_id, ordem)
);

create table if not exists public.crm_cadencia_inscricoes (
  id uuid primary key default gen_random_uuid(),
  cadencia_id uuid not null references public.crm_cadencias(id) on delete cascade,
  contato_id uuid not null references public.crm_contatos(id) on delete cascade,
  negocio_id uuid references public.crm_negocios(id) on delete set null,
  status text not null default 'ativa' check (status in ('ativa', 'pausada', 'concluida', 'cancelada', 'respondeu')),
  etapa_atual integer not null default 0,
  proximo_envio_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (cadencia_id, contato_id)
);

create index if not exists crm_cadencia_fila_idx
  on public.crm_cadencia_inscricoes (status, proximo_envio_em)
  where status = 'ativa';

do $$
declare
  funil uuid;
begin
  select id into funil from public.crm_funis where padrao = true limit 1;
  if funil is null then
    insert into public.crm_funis (nome, descricao, padrao)
    values ('Sprint Presenca', 'Funil comercial principal da Firemode', true)
    returning id into funil;

    insert into public.crm_etapas (funil_id, nome, cor, ordem, tipo) values
      (funil, 'Mapeado', '#64748b', 10, 'aberta'),
      (funil, 'Abordado', '#2563eb', 20, 'aberta'),
      (funil, 'Respondeu', '#7c3aed', 30, 'aberta'),
      (funil, 'Call marcada', '#d97706', 40, 'aberta'),
      (funil, 'Proposta', '#ea580c', 50, 'aberta'),
      (funil, 'Ganho', '#15803d', 60, 'ganha'),
      (funil, 'Perdido', '#dc2626', 70, 'perdida');
  end if;
end $$;

alter table public.crm_funis enable row level security;
alter table public.crm_etapas enable row level security;
alter table public.crm_contatos enable row level security;
alter table public.crm_negocios enable row level security;
alter table public.crm_atividades enable row level security;
alter table public.crm_emails enable row level security;
alter table public.crm_cadencias enable row level security;
alter table public.crm_cadencia_etapas enable row level security;
alter table public.crm_cadencia_inscricoes enable row level security;

revoke all on public.crm_funis, public.crm_etapas, public.crm_contatos,
  public.crm_negocios, public.crm_atividades, public.crm_emails,
  public.crm_cadencias, public.crm_cadencia_etapas,
  public.crm_cadencia_inscricoes from anon, authenticated;
