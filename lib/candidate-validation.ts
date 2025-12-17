/**
 * Validações para candidatos
 */

export interface CandidatoRequisitos {
  testeHabilidadesCompleto: boolean
  autoavaliacaoCompleta: boolean
}

/**
 * Verifica se o candidato completou todos os testes e autoavaliações
 * @param requisitos Objeto com status dos testes
 * @returns true se todos os requisitos foram atendidos
 */
export function podeAplicarParaVaga(requisitos: CandidatoRequisitos): boolean {
  return requisitos.testeHabilidadesCompleto && requisitos.autoavaliacaoCompleta
}

/**
 * Retorna uma mensagem descritiva sobre o que falta completar
 * @param requisitos Objeto com status dos testes
 * @returns Array com mensagens de requisitos não atendidos
 */
export function obterRequisitosPendentes(requisitos: CandidatoRequisitos): string[] {
  const pendentes: string[] = []

  if (!requisitos.testeHabilidadesCompleto) {
    pendentes.push("Teste de Habilidades")
  }

  if (!requisitos.autoavaliacaoCompleta) {
    pendentes.push("Autoavaliação")
  }

  return pendentes
}

/**
 * Retorna a porcentagem de conclusão dos requisitos
 * @param requisitos Objeto com status dos testes
 * @returns Porcentagem de conclusão (0-100)
 */
export function obterPorcentagemRequisitos(requisitos: CandidatoRequisitos): number {
  let completos = 0
  const total = 2

  if (requisitos.testeHabilidadesCompleto) completos++
  if (requisitos.autoavaliacaoCompleta) completos++

  return Math.round((completos / total) * 100)
}
