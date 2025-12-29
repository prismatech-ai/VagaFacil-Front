"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { AceiteEntrevista } from "@/components/aceite-entrevista"
import { useEffect, useState, Suspense } from "react"

function InterviewAcceptanceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  // Params da URL para dados da entrevista
  const vagaId = searchParams.get("vaga_id") || "1"
  const conviteId = searchParams.get("id") || "conv-001"
  const empresaNome = searchParams.get("empresa") || "TechCorp"
  const vagaTitulo = searchParams.get("vaga") || "Desenvolvedor React Sênior"
  const dataConvite = searchParams.get("data") || "2024-01-20"
  const competenciasStr = searchParams.get("competencias") || "React,TypeScript,Node.js"
  const competenciasRequeridas = competenciasStr.split(",").map((c) => c.trim())

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAccept = async (id: string) => {
    try {
      // POST /candidato/aceitar-entrevista/{vaga_id}
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidato/aceitar-entrevista/${vagaId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
          },
          body: JSON.stringify({
            consentimento: true
          })
        }
      )
      
      if (response.ok) {
        console.log("Entrevista aceita:", id)
        router.push("/dashboard/candidato")
      } else {
        console.error("Erro ao aceitar entrevista:", response.status)
      }
    } catch (error) {
      console.error("Erro ao aceitar entrevista:", error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      console.log("Entrevista rejeitada:", id)
      // Redirect sem enviar (consentimento = false implícito)
      router.push("/dashboard/candidato")
    } catch (error) {
      console.error("Erro ao rejeitar entrevista:", error)
    }
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
  return (
    <Suspense fallback={null}>
      <InterviewAcceptanceContent />
    </Suspense>
  )
}
