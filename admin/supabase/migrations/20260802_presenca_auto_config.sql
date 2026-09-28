-- Config de verificação automática de presença por conta (cliente).
-- Intervalos: 7, 15 ou 30 dias. Cron externo (n8n/Vercel) chama a API admin.

create table if not exists public.presenca_auto_config (
  cliente_handle text primary key references public.clientes (handle) on delete cascade,
  ativo boolean not null default true,
  intervalo_dias integer not null default 15
    check (intervalo_dias in (7, 15, 30)),
  ultima_verificacao_em timestamptz,
  ultimo_job_id text,
  ultimo_delta jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.presenca_auto_config is
  'Cron de reauditoria de presença por cliente (7/15/30 dias) + último delta de scorecard';
comment on column public.presenca_auto_config.intervalo_dias is
  'Frequência da verificação automática: 7, 15 ou 30';
comment on column public.presenca_auto_config.ultimo_delta is
  'Resumo da última comparação (melhorou/piorou/mudou) após o cron';

create index if not exists presenca_auto_config_due_idx
  on public.presenca_auto_config (ativo, intervalo_dias, ultima_verificacao_em)
  where ativo = true;

alter table public.presenca_auto_config enable row level security;
