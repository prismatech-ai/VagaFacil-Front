/**
 * API Client para Perfil do Candidato
 * 
 * Implementa os endpoints de perfil:
 * 1. GET /api/v1/candidates/me - Obter perfil completo
 * 2. PUT /api/v1/candidates/me - Atualizar perfil
 */

import { api } from "./api"
import type { Candidato } from "./types"

const BASE_URL = "/api/v1/candidates"

export const candidatesApi = {
  /**
   * GET /api/v1/candidates/me
   * Retorna o perfil completo do candidato logado
   * Inclui: dados pessoais, endereço, profissional, PCD e progresso do onboarding
   */
  async obterPerfil(): Promise<Candidato> {
    return api.get<Candidato>(`${BASE_URL}/me`)
  },

  /**
   * PUT /api/v1/candidates/me
   * Atualiza o perfil do candidato
   * Todos os campos são opcionais - atualize apenas o necessário
   * 
   * @param dados - Dados parciais do candidato a atualizar
   * @returns Perfil atualizado
   */
  async atualizarPerfil(dados: Partial<Candidato>): Promise<Candidato> {
    return api.put<Candidato>(`${BASE_URL}/me`, dados)
  },
}

export default candidatesApi
