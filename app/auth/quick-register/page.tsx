"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RegistroCandidatoStep1 } from "@/components/registro-candidato-step1"
import { SelecionaArea } from "@/components/seleciona-area"
import { AutoavaliacaoCompetencias } from "@/components/autoavaliacao-competencias"
import { ResumoAutoavaliacao } from "@/components/resumo-autoavaliacao"

type Step = "registro" | "area" | "competencias" | "resumo"

interface Competencia {
  id: string
  nome: string
  nivel: 1 | 2 | 3 | 4 | null
}

export default function QuickRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("registro")
  const [registroData, setRegistroData] = useState({ nome: "", email: "", senha: "" })
  const [areaId, setAreaId] = useState("")
  const [competencias, setCompetencias] = useState<Competencia[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleRegistroComplete = (data: { nome: string; email: string; senha: string }) => {
    setRegistroData(data)
    setStep("area")
  }

  const handleAreaComplete = (selectedAreaId: string) => {
    setAreaId(selectedAreaId)
    setStep("competencias")
  }

  const handleCompetenciasComplete = (selectedCompetencias: Competencia[]) => {
    setCompetencias(selectedCompetencias)
    setStep("resumo")
  }

  const handleEditCompetencias = () => {
    setStep("competencias")
  }

  const handleContinueFromResumo = async () => {
    setIsLoading(true)
    try {
      // TODO: Salvar dados no backend
      const candidatoData = {
        nome: registroData.nome,
        email: registroData.email,
        area: areaId,
        competencias: competencias,
      }
      console.log("Dados do candidato:", candidatoData)
      
      // Redirecionar para página de testes
      router.push("/dashboard/candidato/testes")
    } catch (error) {
      console.error("Erro ao salvar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {step === "registro" && (
        <RegistroCandidatoStep1
          onComplete={handleRegistroComplete}
          isLoading={isLoading}
        />
      )}

      {step === "area" && (
        <SelecionaArea
          onComplete={handleAreaComplete}
          isLoading={isLoading}
        />
      )}

      {step === "competencias" && (
        <AutoavaliacaoCompetencias
          areaId={areaId}
          onComplete={handleCompetenciasComplete}
          isLoading={isLoading}
        />
      )}

      {step === "resumo" && (
        <ResumoAutoavaliacao
          competencias={competencias.filter(c => c.nivel !== null) as Array<{ id: string; nome: string; nivel: 1 | 2 | 3 | 4 }>}
          onEdit={handleEditCompetencias}
          onContinue={handleContinueFromResumo}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
