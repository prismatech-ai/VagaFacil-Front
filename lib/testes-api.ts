import { api } from "./api"

interface Teste {
  id: string
  titulo: string
  descricao: string
  tipo: "habilidades" | "autoavaliacao"
  perguntas: any[]
  tempo_limite?: number
}

interface ResultadoTeste {
  score: number
  dados_teste?: {
    tempo_resposta?: string
    total_perguntas?: number
    acertos?: number
  }
}

const testesApi = {
  // Listar testes disponíveis
  async listarTestes(): Promise<Teste[]> {
    try {
      const response = await fetch("/api/v1/candidates/testes")
      if (!response.ok) {
        console.warn("API testes não disponível, retornando array vazio")
        return []
      }
      return await response.json()
    } catch (err) {
      console.warn("Erro ao listar testes:", err)
      return []
    }
  },

  // Obter um teste específico
  async obterTeste(testId: string): Promise<Teste> {
    try {
      const response = await fetch(`/api/v1/candidates/testes/${testId}`)
      if (!response.ok) {
        throw new Error("Erro ao obter teste")
      }
      return await response.json()
    } catch (err) {
      console.error("Erro ao obter teste:", err)
      throw err
    }
  },

  // Submeter teste
  async submeterTeste(testId: string, respostas: any): Promise<ResultadoTeste> {
    try {
      const response = await fetch(`/api/v1/candidates/testes/${testId}/submeter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(respostas),
      })
      if (!response.ok) {
        throw new Error("Erro ao submeter teste")
      }
      return await response.json()
    } catch (err) {
      console.error("Erro ao submeter teste:", err)
      throw err
    }
  },

  // Iniciar teste adaptativo
  async iniciarTesteAdaptativo(testId: string): Promise<{ sessao_id: string; questao: any }> {
    try {
      const response = await fetch(`/api/v1/candidates/testes/adaptativo/iniciar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teste_id: testId }),
      })
      if (!response.ok) {
        throw new Error("Erro ao iniciar teste adaptativo")
      }
      return await response.json()
    } catch (err) {
      console.error("Erro ao iniciar teste adaptativo:", err)
      throw err
    }
  },

  // Responder questão do teste adaptativo e obter próxima
  async responderTesteAdaptativo(sessaoId: string, respostaId: number): Promise<{ questao?: any; resultado?: any; finalizado: boolean }> {
    try {
      const response = await fetch(`/api/v1/candidates/testes/adaptativo/sessao/${sessaoId}/responder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resposta_id: respostaId }),
      })
      if (!response.ok) {
        throw new Error("Erro ao responder questão")
      }
      return await response.json()
    } catch (err) {
      console.error("Erro ao responder questão:", err)
      throw err
    }
  },

  // Obter resultado final do teste adaptativo
  async obterResultadoTesteAdaptativo(sessaoId: string): Promise<ResultadoTeste> {
    try {
      const response = await fetch(`/api/v1/candidates/testes/adaptativo/sessao/${sessaoId}/resultado`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error("Erro ao obter resultado")
      }
      return await response.json()
    } catch (err) {
      console.error("Erro ao obter resultado:", err)
      throw err
    }
  },
}

export default testesApi
