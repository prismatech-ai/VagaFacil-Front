"use client"

import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { DetalhesCandidatoAnonimos } from "@/components/detalhe-candidato-anonimo"
import { DetalhesCandidatoDadosLiberados } from "@/components/detalhe-candidato-dados-liberados"

export default function CandidateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const candidateId = params.candidateId as string

  // Simulate checking if data is unlocked
  // In production, this would come from backend
  const [isDataUnlocked, setIsDataUnlocked] = useState(false)

  const competenciasArray = [
    { nome: "React", nivelDeclarado: 4 as const, testeScore: 92 },
    { nome: "TypeScript", nivelDeclarado: 4 as const, testeScore: 88 },
    { nome: "Node.js", nivelDeclarado: 3 as const, testeScore: 85 },
    { nome: "PostgreSQL", nivelDeclarado: 2 as const, testeScore: 78 },
    { nome: "Docker", nivelDeclarado: 3 as const, testeScore: 82 },
  ]

  const mockUnlockedData = {
    candidatoId: candidateId,
    dadosPessoais: {
      nome: "João Silva",
      email: "joao.silva@email.com",
      telefone: "(11) 98765-4321",
      curriculo: "Link para o currículo",
    },
    competencias: competenciasArray,
  }

  const handleShowInterest = () => {
    console.log(`Showed interest to candidate ${candidateId}`)
    // In production, this would trigger the interview acceptance flow
  }

  const handleBack = () => {
    router.push(`/empresa/jobs/${jobId}/kanban`)
  }

  if (!isDataUnlocked) {
    return (
      <DetalhesCandidatoAnonimos
        candidatoId={candidateId}
        competencias={competenciasArray}
        onDemonstraInteresse={handleShowInterest}
        onBack={handleBack}
      />
    )
  }

  return (
    <DetalhesCandidatoDadosLiberados
      candidatoId={candidateId}
      dadosPessoais={mockUnlockedData.dadosPessoais}
      competencias={competenciasArray}
      onBack={handleBack}
    />
  )
}
