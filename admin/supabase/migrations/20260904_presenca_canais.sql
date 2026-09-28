-- Um JSON completo por ferramenta/canal; analises_web.presenca fica só com meta/resumo.
CREATE TABLE IF NOT EXISTS public.presenca_canais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analise_web_id uuid NOT NULL REFERENCES public.analises_web(id) ON DELETE CASCADE,
  chave text NOT NULL,
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT presenca_canais_chave_check CHECK (chave ~ '^[a-z0-9_]+$'),
  CONSTRAINT presenca_canais_unique UNIQUE (analise_web_id, chave)
);

CREATE INDEX IF NOT EXISTS presenca_canais_analise_idx
  ON public.presenca_canais (analise_web_id);

COMMENT ON TABLE public.presenca_canais IS
  'Payload completo de cada auditoria de presença (instagram, blog, gmb…). Separado de analises_web.presenca para não derrubar a UI.';

ALTER TABLE public.presenca_canais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "presenca_canais_select" ON public.presenca_canais;
CREATE POLICY "presenca_canais_select" ON public.presenca_canais
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "presenca_canais_write" ON public.presenca_canais;
CREATE POLICY "presenca_canais_write" ON public.presenca_canais
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
