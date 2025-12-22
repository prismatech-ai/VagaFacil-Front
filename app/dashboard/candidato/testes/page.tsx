"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TestesTecnicos } from "@/components/testes-tecnicos"

interface Teste {
  id: string
  competenciaId: string
  competenciaNome: string
  nivelTeste: 1 | 2 | 3 | 4
  status: "nao-iniciado" | "em-progresso" | "concluido"
  tempoLimite: number
  respostasCorretas?: number
  totalPerguntas?: number
}

export default function TestesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Mock de testes - em produção viriam do backend
  const [testes, setTestes] = useState<Teste[]>([
    {
      id: "test-1",
      competenciaId: "react",
      competenciaNome: "React",
      nivelTeste: 2,
      status: "nao-iniciado",
      tempoLimite: 20,
    },
    {
      id: "test-2",
      competenciaId: "js",
      competenciaNome: "JavaScript",
      nivelTeste: 2,
      status: "nao-iniciado",
      tempoLimite: 15,
    },
  ])

  const handleTestStart = (testeId: string) => {
    setTestes(
      testes.map((t) => (t.id === testeId ? { ...t, status: "em-progresso" } : t))
    )
  }

  const handleTestComplete = (testeId: string, score: number) => {
    setTestes(
      testes.map((t) =>
        t.id === testeId
          ? {
              ...t,
              status: "concluido",
              respostasCorretas: score,
              totalPerguntas: 10,
            }
          : t
      )
    )

    // Se todos os testes foram concluídos
    const todosCompletos = testes.every((t) => t.status === "concluido")
    if (todosCompletos) {
      setTimeout(() => {
        handleContinue()
      }, 2000)
    }
  }

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      // TODO: Salvar scores no backend
      console.log("Testes concluídos:", testes)
      router.push("/dashboard/candidato/onboarding-concluido")
    } catch (error) {
      console.error("Erro ao salvar testes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TestesTecnicos
      testes={testes}
      onTestStart={handleTestStart}
      onTestComplete={handleTestComplete}
      onAllTestsComplete={handleContinue}
      isLoading={isLoading}
    />
  )
}
