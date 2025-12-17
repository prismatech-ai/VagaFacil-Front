/**
 * API Client para Onboarding do Candidato
 * 
 * Implementa os endpoints de onboarding:
 * 1. GET /api/v1/candidates/onboarding/status - Obter status
 * 2. GET /api/v1/candidates/onboarding/progresso - Obter progresso
 * 3. POST /api/v1/candidates/onboarding/dados-pessoais - Salvar dados pessoais
 * 4. POST /api/v1/candidates/onboarding/dados-profissionais - Salvar dados profissionais
 * 5. POST /api/v1/candidates/onboarding/teste-habilidades - Submeter teste
 */

import { api } from "./api"
import type { OnboardingStatus, OnboardingProgresso, DadosPessoais, DadosProfissionais, TesteHabilidades } from "./types"

const BASE_URL = "/api/v1/candidates/onboarding"

export const onboardingApi = {
  /**
   * GET /api/v1/candidates/onboarding/status
   * Retorna o status completo do onboarding do candidato
   */
  async obterStatus(): Promise<OnboardingStatus> {
    return api.get<OnboardingStatus>(`${BASE_URL}/status`)
  },

  /**
   * GET /api/v1/candidates/onboarding/progresso
   * Retorna o progresso do onboarding (percentual, etapas completas)
   */
  async obterProgresso(): Promise<OnboardingProgresso> {
    return api.get<OnboardingProgresso>(`${BASE_URL}/progresso`)
  },

  /**
   * POST /api/v1/candidates/onboarding/dados-pessoais
   * Salva os dados pessoais (passo 1 - 25%)
   * @param dados - Dados pessoais do candidato
   */
  async salvarDadosPessoais(dados: DadosPessoais): Promise<OnboardingProgresso> {
    return api.post<OnboardingProgresso>(`${BASE_URL}/dados-pessoais`, dados)
  },

  /**
   * POST /api/v1/candidates/onboarding/dados-profissionais
   * Salva os dados profissionais (passo 2 - 50%)
   * @param dados - Dados profissionais do candidato
   */
  async salvarDadosProfissionais(dados: DadosProfissionais): Promise<OnboardingProgresso> {
    return api.post<OnboardingProgresso>(`${BASE_URL}/dados-profissionais`, dados)
  },

  /**
   * POST /api/v1/candidates/onboarding/teste-habilidades
   * Submete o teste de habilidades (passo 3 - 100%)
   * @param dados - Resultado do teste
   */
  async submeterTesteHabilidades(dados: TesteHabilidades): Promise<OnboardingProgresso> {
    return api.post<OnboardingProgresso>(`${BASE_URL}/teste-habilidades`, dados)
  },
}

export default onboardingApi
