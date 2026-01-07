"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { AceiteEntrevista } from "@/components/aceite-entrevista"
import { useEffect, useState, Suspense } from "react"
import { api } from "@/lib/api"

function InterviewAcceptanceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [vagaData, setVagaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Params da URL
  const vagaId = searchParams.get("vaga_id") || "1"

  // Carregar dados da vaga
  useEffect(() => {
    const carregarVaga = async () => {
      try {
        setIsLoading(true)

        // Busca todas as vagas e filtra pela vaga_id
        const response = await api.get<any>("/api/v1/candidato/vagas-sugeridas")

        if (response?.vagas_sugeridas && Array.isArray(response.vagas_sugeridas)) {
          const vaga = response.vagas_sugeridas.find((v: any) => v.vaga_id === parseInt(vagaId))
          if (vaga) {

            setVagaData(vaga)
          } else {

          }
        }
      } catch (err: any) {

      } finally {
        setIsLoading(false)
        setMounted(true)
      }
    }

    carregarVaga()
  }, [vagaId])

  // Fallback para dados padrão se não conseguir carregar
  const nomeEmpresa = vagaData?.empresa?.nome || "Uma Empresa"
  const vagaTitulo = vagaData?.titulo_vaga || "Desenvolvedor"
  const dataConvite = vagaData?.interesse?.data_interesse || new Date().toISOString()
  const requisitos = vagaData?.requisitos || []
  const competenciasRequeridas = Array.isArray(requisitos) 
    ? requisitos.slice(0, 3).map((r: any) => typeof r === 'string' ? r : r.nome || r.titulo || r.skill)
    : []

  const handleAccept = async (id: string) => {
    try {
      // POST /api/v1/candidato/aceitar-entrevista/{vaga_id} - novo endpoint com email via Resend
      const response = await api.post(
        `/api/v1/candidato/aceitar-entrevista/${vagaId}`,
        {}
      )
      
      // Mostrar sucesso
      alert("✅ Entrevista aceita com sucesso! Email de confirmação foi enviado para você e para a empresa.")
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/dashboard/candidato")
      }, 2000)
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : "Erro ao aceitar entrevista"
      alert(`❌ ${errorMsg}`)
    }
  }

  const handleReject = async (id: string) => {
    try {

      // Redirect sem enviar (consentimento = false implícito)
      router.push("/dashboard/candidato")
    } catch (error) {

    }
  }

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#03565C]"></div>
          <p className="mt-4 text-gray-600">Carregando informações da vaga...</p>
        </div>
      </div>
    )
  }

  return (
    <AceiteEntrevista
      conviteId={`vaga-${vagaId}`}
      empresaNome={nomeEmpresa}
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
