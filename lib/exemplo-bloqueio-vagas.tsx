"use client"

/**
 * Exemplo de como integrar a validação de requisitos no dashboard do candidato
 * Copie este código e adapte para sua página de vagas/candidaturas
 */

import { useRouter } from "next/navigation"
import { RequisitosBloqueio } from "@/components/requisitos-bloqueio"
import type { CandidatoRequisitos } from "@/lib/candidate-validation"

// Exemplo de uso em uma página de vagas
export function ExemploUsoBloqueio() {
  const router = useRouter()

  // Obter os requisitos do localStorage ou de um contexto/API
  const requisitos: CandidatoRequisitos = {
    testeHabilidadesCompleto: localStorage.getItem("testeConcluido") === "true",
    autoavaliacaoCompleta: localStorage.getItem("autoavaliacaoConcluida") === "true",
  }

  return (
    <div className="space-y-6">
      {/* Mostrar o bloqueio se não tiver completado */}
      <RequisitosBloqueio
        requisitos={requisitos}
        onRedirectOnboarding={() => router.push("/dashboard/candidato/onboarding")}
      />

      {/* Resto do conteúdo de vagas só aparece se requisitos atendidos */}
      {requisitos.testeHabilidadesCompleto && requisitos.autoavaliacaoCompleta && (
        <div>
          {/* Seu conteúdo de vagas aqui */}
          <p>Exiba as vagas disponíveis</p>
        </div>
      )}
    </div>
  )
}

/**
 * Para usar em qualquer componente:
 *
 * 1. Importe as funções de validação:
 *    import { podeAplicarParaVaga, obterRequisitosPendentes } from "@/lib/candidate-validation"
 *
 * 2. Obtenha os requisitos (do localStorage ou uma API):
 *    const requisitos: CandidatoRequisitos = {
 *      testeHabilidadesCompleto: localStorage.getItem("testeConcluido") === "true",
 *      autoavaliacaoCompleta: localStorage.getItem("autoavaliacaoConcluida") === "true",
 *    }
 *
 * 3. Use a validação:
 *    if (!podeAplicarParaVaga(requisitos)) {
 *      const pendentes = obterRequisitosPendentes(requisitos)
 *      toast.error(`Complete: ${pendentes.join(", ")}`)
 *      return
 *    }
 *
 * 4. Ou use o componente visual:
 *    <RequisitosBloqueio requisitos={requisitos} />
 */
