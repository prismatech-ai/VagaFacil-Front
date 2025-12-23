"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { AceiteEntrevista } from "@/components/aceite-entrevista"
import { useEffect, useState } from "react"

// Disable static pre-rendering for this page since it uses dynamic search params
export const dynamic = "force-dynamic"

function InterviewAcceptanceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  // Params da URL para dados da entrevista
  const conviteId = searchParams.get("id") || "conv-001"
  const empresaNome = searchParams.get("empresa") || "TechCorp"
  const vagaTitulo = searchParams.get("vaga") || "Desenvolvedor React Sênior"
  const dataConvite = searchParams.get("data") || "2024-01-20"
  const competenciasStr = searchParams.get("competencias") || "React,TypeScript,Node.js"
  const competenciasRequeridas = competenciasStr.split(",").map((c) => c.trim())

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAccept = (id: string) => {
    // Salvar aceitação (integraria com API aqui)
    console.log("Entrevista aceita:", id)
    // Após aceitar entrevista, retorna ao dashboard do candidato
    router.push("/dashboard/candidato")
  }

  const handleReject = (id: string) => {
    console.log("Entrevista rejeitada:", id)
    // Ao rejeitar, retorna ao dashboard do candidato
    router.push("/dashboard/candidato")
  }

  if (!mounted) return null

  return (
    <AceiteEntrevista
      conviteId={conviteId}
      empresaNome={empresaNome}
      vagaTitulo={vagaTitulo}
      dataConvite={dataConvite}
      competenciasRequeridas={competenciasRequeridas}
      onAccept={handleAccept}
      onReject={handleReject}
    />
  )
}

export default function InterviewAcceptancePage() {
  return <InterviewAcceptanceContent />
}
