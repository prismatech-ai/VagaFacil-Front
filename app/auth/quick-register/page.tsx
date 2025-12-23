"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RegistroCandidatoStep1 } from "@/components/registro-candidato-step1"
import { SelecionaArea } from "@/components/seleciona-area"
import { AutoavaliacaoCompetencias } from "@/components/autoavaliacao-competencias"
import { ResumoAutoavaliacao } from "@/components/resumo-autoavaliacao"
import { Logo } from "@/components/logo"

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
      
      // Após completar o quick-register, redireciona para o dashboard do candidato
      router.push("/dashboard/candidato")
    } catch (error) {
      console.error("Erro ao salvar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-secondary/30">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo width={180} />
        </div>

        {/* Conteúdo */}
        <div className="w-full">
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

        {/* Voltar para página inicial */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
