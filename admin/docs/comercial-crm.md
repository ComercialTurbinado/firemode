# CRM comercial Firemode

## Ativação

1. Rode `npm run db:migrate:comercial` para aplicar somente
   `supabase/migrations/20260908_comercial_crm.sql`.
2. Configure no ambiente da aplicação:

   - `MAILGUN_API_KEY`
   - `MAILGUN_DOMAIN`
   - `MAILGUN_FROM`
   - `MAILGUN_WEBHOOK_SIGNING_KEY`
   - `MAILGUN_BASE_URL` (opcional; use `https://api.eu.mailgun.net` para região EU)
   - `APP_URL` com a URL pública HTTPS
   - `CRM_CADENCE_CRON_SECRET`

3. Abra **Fireadmin → Comercial → E-mails** e clique em **Ativar recebimento**.
4. Agende uma chamada `POST /api/webhooks/comercial/cadencias` com o header
   `Authorization: Bearer <CRM_CADENCE_CRON_SECRET>`.

## Fluxo padrão

`Mapeado → Abordado → Respondeu → Call marcada → Proposta → Ganho/Perdido`

- Um lead qualificado no chat da LP cria ou atualiza o contato e abre uma
  oportunidade de R$ 3.900 em **Mapeado**.
- Uma resposta recebida pelo Mailgun interrompe cadências ativas e move
  oportunidades em **Mapeado/Abordado** para **Respondeu**.
- Cadências podem combinar e-mail automático com tarefas de WhatsApp, ligação
  ou execução manual.

## Segurança

- As tabelas usam RLS e não concedem acesso a `anon` ou `authenticated`.
- O admin acessa os dados somente pelas rotas protegidas do backend.
- O webhook do Mailgun valida assinatura e expiração.
- O executor de cadências exige segredo Bearer.
