-- LP /vender/presenca — conversas do chat SDR (continuidade WhatsApp + follow-up)
-- Projeto original Firemode: mblntoimrkfoocbztozb
-- Aplicar: npm run db:push  |  ou SQL Editor no dashboard

create table if not exists public.lp_presenca_conversas (
  id uuid primary key default gen_random_uuid(),
  whatsapp_digits text not null,
  nome text not null,
  email text not null,
  presence text,
  messages jsonb not null default '[]'::jsonb,
  phase text not null default 'discovery',
  follow_up_status text not null default 'active'
    check (follow_up_status in ('active', 'closed_won', 'closed_lost', 'opted_out')),
  follow_up_count integer not null default 0,
  next_follow_up_at timestamptz,
  last_message_at timestamptz not null default now(),
  is_cliente boolean not null default false,
  expires_at timestamptz not null,
  browser_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists lp_presenca_conversas_wa_uidx
  on public.lp_presenca_conversas (whatsapp_digits);

create index if not exists lp_presenca_conversas_follow_up_idx
  on public.lp_presenca_conversas (follow_up_status, next_follow_up_at)
  where follow_up_status = 'active';

create index if not exists lp_presenca_conversas_expires_idx
  on public.lp_presenca_conversas (expires_at)
  where is_cliente = false;

alter table public.lp_presenca_conversas enable row level security;

-- Sem policies para anon/authenticated: só service_role (API Next) acessa.
revoke all on public.lp_presenca_conversas from anon, authenticated;

comment on table public.lp_presenca_conversas is
  'Chat SDR da LP presença. Não-cliente: expires_at ~7 dias. Follow-up até fechar/opt-out.';
