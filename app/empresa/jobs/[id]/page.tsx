"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Edit, Trash2, Users, CheckCircle2, Clock } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { KanbanVaga } from "@/components/kanban-vaga"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function VagaDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const vagaId = params.id as string
  const [vaga, setVaga] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showKanban, setShowKanban] = useState(false)
  const [candidatos, setCandidatos] = useState<any[]>([])
  const [isLoadingCandidatos, setIsLoadingCandidatos] = useState(false)
  const [selectedCandidatoDetails, setSelectedCandidatoDetails] = useState<any>(null)

  const getNivelLabel = (nivel: number) => {
    const niveis = {
      1: "Iniciante",
      2: "Intermediário",
      3: "Avançado",
      4: "Expert",
    }
    return niveis[nivel as keyof typeof niveis] || "Desconhecido"
  }

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: { label: string; badge: string; badgeClass: string } } = {
      aberta: { label: "Aberta", badge: "Ativa", badgeClass: "bg-green-600" },
      rascunho: { label: "Rascunho", badge: "Rascunho", badgeClass: "bg-yellow-600" },
      fechado: { label: "Fechada", badge: "Inativa", badgeClass: "bg-red-600" },
    }
    return statusMap[status] || { label: "Desconhecido", badge: "Desconhecido", badgeClass: "bg-gray-600" }
  }

  useEffect(() => {
    if (vagaId) {
      fetchVagaDetails()
      fetchCandidatos()
    }
  }, [vagaId])

  const fetchVagaDetails = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/api/v1/jobs/${vagaId}`)
      const jobData = (response as any).data || response
      setVaga(jobData)
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : "Erro ao carregar detalhes da vaga"
      
      // Se for erro 401, redirecionar para login
      if (errorMsg.includes("401") || errorMsg.includes("Não autenticado")) {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente",
          variant: "destructive",
        })
        router.push("/login")
        return
      }
      
      console.error("❌ Erro ao carregar detalhes da vaga:", error)
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCandidatos = async () => {
    setIsLoadingCandidatos(true)
    try {
      const response = await api.get("/api/v1/companies/candidatos-anonimos")
      const data = (response as any).data || response
      const candidatosData = data.candidatos || data
      setCandidatos(Array.isArray(candidatosData) ? candidatosData : [])
      console.log("✅ Candidatos carregados:", candidatosData)
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : "Erro ao carregar candidatos"
      
      // Se for erro 401, redirecionar para login
      if (errorMsg.includes("401") || errorMsg.includes("Não autenticado")) {
        router.push("/login")
        return
      }
      
      console.error("❌ Erro ao carregar candidatos:", error)
      setCandidatos([])
    } finally {
      setIsLoadingCandidatos(false)
    }
  }

  const fetchCandidatoDetalhes = async (idAnonimo: string) => {
    try {
      const response = await api.get(`/api/v1/companies/candidatos-anonimos/detalhes/${idAnonimo}`)
      const detalhes = (response as any).data || response
      setSelectedCandidatoDetails(detalhes)
      console.log("✅ Detalhes do candidato carregados:", detalhes)
    } catch (error: any) {
      console.error("❌ Erro ao carregar detalhes do candidato:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar detalhes do candidato",
        variant: "destructive",
      })
    }
  }

  const handleViewCandidato = async (candidatoId: string) => {
    await fetchCandidatoDetalhes(candidatoId)
  }

  const handleMoverCandidato = async (candidatoId: string, novaColuna: string) => {
    try {
      console.log(`📍 Movendo candidato ${candidatoId} para coluna ${novaColuna}`)
      // Aqui você pode fazer uma chamada à API para salvar a posição
      // await api.post(`/api/v1/companies/candidatos-anonimos/${candidatoId}/coluna`, { coluna: novaColuna })
    } catch (error) {
      console.error("❌ Erro ao mover candidato:", error)
    }
  }

  const transformarCandidatos = (candidatosAnonimos: any[]) => {
    return candidatosAnonimos.map((candidato) => ({
      id: candidato.id_anonimo,
      candidatoId: candidato.id_anonimo,
      competenciasDeclaradas: candidato.habilidades 
        ? candidato.habilidades.split(",").map((h: string) => h.trim())
        : [],
      testes: candidato.score_teste_habilidades 
        ? [{ competencia: "Geral", score: Math.min(10, (candidato.score_teste_habilidades / 100) * 10) }]
        : [],
      demonstrouInteresse: false,
      aceituEntrevista: false,
      dataDemonstrouInteresse: undefined,
      estado: candidato.estado,
      cidade: candidato.cidade,
      genero: candidato.genero,
      area_atuacao: candidato.area_atuacao,
      is_pcd: candidato.is_pcd,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (!vaga) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            Vaga não encontrada
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.back()}>Voltar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showKanban ? (
        <>
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKanban(false)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos Detalhes
            </Button>
          </div>
          <KanbanVaga
            vagaId={vagaId}
            vagaTitulo={vaga.title}
            areaVaga={vaga.location || ""}
            candidatos={transformarCandidatos(candidatos)}
            onViewCandidato={handleViewCandidato}
            onMoverCandidato={handleMoverCandidato}
            isLoading={isLoadingCandidatos}
          />
        </>
      ) : (
        <>
          {/* Header with Back Button */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{vaga.title}</h1>
              <p className="text-gray-600 mt-1">{vaga.location} • {vaga.job_type}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
                Deletar
              </Button>
            </div>
          </div>

          {/* Status and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-2xl font-bold text-[#03565C] mt-1">
                      {getStatusLabel(vaga.status).label}
                    </p>
                  </div>
                  <Badge className={`${getStatusLabel(vaga.status).badgeClass} text-white`}>
                    {getStatusLabel(vaga.status).badge}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Convites Realizados</p>
                    <p className="text-2xl font-bold text-[#03565C] mt-1">
                      {vaga.views_count || 0}
                    </p>
                  </div>
                  <Users className="h-6 w-6 text-[#03565C] opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Convites Aceitos</p>
                    <p className="text-2xl font-bold text-[#03565C] mt-1">
                      {vaga.applications_count || 0}
                    </p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Sobre a Vaga</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray-900 text-base leading-relaxed">
                      {vaga.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Tipo de Contrato</p>
                      <p className="font-semibold text-gray-900">{vaga.job_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Local</p>
                      <p className="font-semibold text-gray-900">{vaga.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Remoto</p>
                      <p className="font-semibold text-gray-900">{vaga.remote ? "Sim" : "Não"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Moeda</p>
                      <p className="font-semibold text-gray-900">{vaga.salary_currency}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Salary */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Remuneração</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Salário Mínimo</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {vaga.salary_currency} {vaga.salary_min}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Salário Máximo</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {vaga.salary_currency} {vaga.salary_max}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Requisitos</CardTitle>
                  <CardDescription>
                    Habilidades e experiências necessárias para esta vaga
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-900 text-sm whitespace-pre-wrap">{vaga.requirements}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Benefícios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-900 text-sm whitespace-pre-wrap">{vaga.benefits}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Info Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Criada em</p>
                    <p className="font-medium text-gray-900">
                      {new Date(vaga.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-gray-600">Última atualização</p>
                    <p className="font-medium text-gray-900">
                      {new Date(vaga.updated_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  onClick={() => setShowKanban(true)}
                  className="w-full gap-2 bg-[#03565C] hover:bg-[#024147]"
                >
                  <Users className="h-4 w-4" />
                  Ver Kanban
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/empresa/jobs/list`)}
                >
                  Voltar à Lista
                </Button>
              </div>

              {/* Info Alert */}
              <Alert className="border-[#24BFB0]/30 bg-[#25D9B8]/10">
                <AlertCircle className="h-4 w-4 text-[#03565C]" />
                <AlertDescription className="text-[#03565C] text-sm">
                  <strong>Candidatos:</strong> Aparecem apenas aqueles que atendem aos requisitos mínimos.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
