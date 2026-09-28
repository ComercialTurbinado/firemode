# Supabase — projeto original Firemode

**Project ref:** `mblntoimrkfoocbztozb`  
**URL:** `https://mblntoimrkfoocbztozb.supabase.co`  
(mesmo projeto do content-machine)

## Setup local

```bash
# 1) login (uma vez)
npx supabase login

# 2) linkar este repo ao projeto original
npm run db:link

# 3) aplicar migrations remotas
npm run db:push

# 4) regenerar tipos
npm run db:types
```

## Migration desta feature

`migrations/20260726_lp_presenca_conversas.sql` — tabela `lp_presenca_conversas`
(chat SDR da LP `/vender/presenca`, histórico por WhatsApp, follow-up 7 dias).

`migrations/20260802_presenca_auto_config.sql` — tabela `presenca_auto_config`
(cron de verificação automática 7/15/30 dias por cliente + delta de scorecard).

Aplicar (escolha um):

```bash
# A) CLI linkado
npm run db:link && npm run db:push

# B) Access token (Dashboard → Account → Access Tokens)
export SUPABASE_ACCESS_TOKEN=sbp_...
npm run db:migrate:presenca

# C) Colar o SQL no SQL Editor:
# https://supabase.com/dashboard/project/mblntoimrkfoocbztozb/sql/new
```

## Env (admin-firemode)

```
NEXT_PUBLIC_SUPABASE_URL=https://mblntoimrkfoocbztozb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PRESENCA_CHAT_CRON_SECRET=...   # opcional — follow-ups / n8n
PRESENCA_CRON_SECRET=...        # opcional — cron presença 7/15/30d (fallback: CHAT secret)
```

Cron presença (n8n / Vercel Cron):

```
GET  /api/conteudo/presenca/cron   # lista vencidos
POST /api/conteudo/presenca/cron   # dispara refresh
Authorization: Bearer $PRESENCA_CRON_SECRET
```

APIs usam `createClient()` em `lib/supabase.ts` (service_role, server-only).
