/** Diagnóstico por especialista de canal: comportamento · conteúdo · frequência. */

export type EspecialistaPlanoItem = {
  titulo?: string;
  como?: string | null;
};

export type EspecialistaBloco = {
  papel?: string | null;
  comportamento?: {
    diagnostico?: string | null;
    padroes?: string[];
    recomendacao?: string | null;
  } | null;
  conteudo?: {
    diagnostico?: string | null;
    formatos?: string[];
    recomendacao?: string | null;
  } | null;
  frequencia?: {
    atual?: string | null;
    ideal?: string | null;
    justificativa?: string | null;
    cadencia_sugerida?: string | null;
  } | null;
  /** Prosa: o que trava (não lista de tarefas) */
  travando?: string | null;
  /** Melhor mundo realista após correções */
  visao_pos_ajuste?: string | null;
  plano_7_15_30?: {
    d7?: EspecialistaPlanoItem[];
    d15?: EspecialistaPlanoItem[];
    d30?: EspecialistaPlanoItem[];
  } | null;
  resumo_especialista?: string | null;
};

export function temEspecialista(e?: EspecialistaBloco | null): boolean {
  if (!e) return false;
  return !!(
    e.resumo_especialista
    || e.travando
    || e.visao_pos_ajuste
    || e.comportamento?.diagnostico
    || e.conteudo?.diagnostico
    || e.frequencia?.ideal
    || e.frequencia?.atual
  );
}
