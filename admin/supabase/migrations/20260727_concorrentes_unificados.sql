-- Registro mestre de concorrentes: SERP + IA + Ads + manual
-- fonte[] / status / handles / meta_extra

alter table public.concorrentes_web
  alter column dominio drop not null;

alter table public.concorrentes_web
  add column if not exists fonte text[] not null default array['serp']::text[],
  add column if not exists status text not null default 'confirmado',
  add column if not exists handles jsonb not null default '{}'::jsonb,
  add column if not exists meta_extra jsonb not null default '{}'::jsonb;

-- Backfill: quem veio da SERP (aparicoes>0 e não fora_da_serp) = serp confirmado
update public.concorrentes_web
set fonte = array['serp']::text[],
    status = 'confirmado'
where coalesce(array_length(fonte, 1), 0) = 0
   or fonte = array['serp']::text[];

update public.concorrentes_web
set fonte = array['manual']::text[],
    status = 'confirmado'
where fora_da_serp is true
  and coalesce(aparicoes, 0) = 0
  and (porque ilike '%manual%' or porque is null);

comment on column public.concorrentes_web.fonte is
  'Origens: serp | ia | ads | manual (pode ter várias)';
comment on column public.concorrentes_web.status is
  'sugerido | confirmado | rejeitado';
comment on column public.concorrentes_web.handles is
  'Handles sociais: {instagram, tiktok, youtube, facebook_page_id}';
comment on column public.concorrentes_web.meta_extra is
  'Extras: aparicoes_ia, anunciante, page_name, ultima_fonte_em…';

create index if not exists concorrentes_web_analise_status_idx
  on public.concorrentes_web (analise_web_id, status);

create index if not exists concorrentes_web_analise_nome_idx
  on public.concorrentes_web (analise_web_id, lower(nome));
