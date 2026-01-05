"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { AlertCircle, Calendar, CheckCircle2, XCircle, Search, Eye, Edit2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VagaSummary {
  id: string
  titulo: string
  status: string
  candidatos_count: number
}

interface Candidato {
  id_anonimo: string
  nome?: string
  email?: string
  area_atuacao?: string
  estado?: string
  cidade?: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "aberta":
      return "bg-green-100 text-green-800"
    case "fechada":
      return "bg-red-100 text-red-800"
    case "rascunho":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function EmpresaDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [vagas, setVagas] = useState<VagaSummary[]>([])
  const [allVagas, setAllVagas] = useState<VagaSummary[]>([])
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVagas: 0,
    vagasAbertas: 0,
    totalCandidatos: 0,
  })
  
  // Paginação de candidatos
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const CANDIDATOS_POR_PAGINA = 10
  
  // Filtros de candidatos
  const [filtroEstado, setFiltroEstado] = useState("")
  const [filtroCidade, setFiltroCidade] = useState("")
  const [filtroIsPcd, setFiltroIsPcd] = useState<boolean | null>(null)
  const [filtroHabilidade, setFiltroHabilidade] = useState("")
  const [filtroGenero, setFiltroGenero] = useState("")
  const [filtroExperiencia, setFiltroExperiencia] = useState("")
  const [filtroAreaAtuacao, setFiltroAreaAtuacao] = useState("")
  
  // Pipeline states
  interface PipelineItem {
    candidate_id: number
    candidato: { id: number; nome: string; email: string; area_atuacao: string }
    job_id: number
    titulo_vaga: string
    data_interesse?: string
    data_entrevista?: string
    resultado?: boolean
  }
  
  type StatusTab = "interesse" | "entrevistas" | "contratados"
  
  const [activeTab, setActiveTab] = useState<StatusTab>("interesse")
  const [pipeline, setPipeline] = useState<PipelineItem[]>([])
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<PipelineItem | null>(null)
  const [dataEntrevista, setDataEntrevista] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Recarrega dados quando a página mudar
  useEffect(() => {
    if (paginaAtual > 1) {
      fetchDashboardData()
    }
  }, [paginaAtual])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Paralizar requisições para melhorar performance
      const [vagasResponse, candidatosResponse] = await Promise.all([
        api.get("/api/v1/jobs/").catch(err => ({ error: err })),
        api.get(`/api/v1/companies/candidatos-anonimos?skip=${(paginaAtual - 1) * CANDIDATOS_POR_PAGINA}&limit=${CANDIDATOS_POR_PAGINA}`).catch(err => ({ error: err }))
      ])

      // Processar vagas
      if (!('error' in vagasResponse)) {
        try {
          const vagasList = (vagasResponse as any).data || vagasResponse
          const vagasAbertas = vagasList.filter((v: any) => v.status === "aberta")

          setVagas(vagasList.slice(0, 5))
          setAllVagas(vagasList)

          setStats({
            totalVagas: vagasList.length,
            vagasAbertas: vagasAbertas.length,
            totalCandidatos: 0,
          })
        } catch (error) {
          console.error("Erro ao processar vagas:", error)
          setVagas([])
          setAllVagas([])
        }
      } else {
        const errorMsg = (vagasResponse as any).error instanceof Error ? (vagasResponse as any).error.message : "Erro ao buscar vagas"
        
        if (errorMsg.includes("empresa não encontrada")) {
          toast({
            title: "Aviso",
            description: "Nenhuma empresa encontrada. Por favor, complete seu perfil de empresa.",
            variant: "default",
          })
        }
        setVagas([])
        setAllVagas([])
      }

      // Processar candidatos
      if (!('error' in candidatosResponse)) {
        try {
          processarCandidatasDashboard(candidatosResponse)
        } catch (error) {
          console.error("Erro ao processar candidatos:", error)
          setCandidatos([])
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const processarCandidatasDashboard = (candidatosResponse: any) => {
    let candidatosList = []
    let totalCount = 0
    
    if (candidatosResponse && typeof candidatosResponse === 'object') {
      if (Array.isArray(candidatosResponse)) {
        candidatosList = candidatosResponse
      } else if ((candidatosResponse as any).data && Array.isArray((candidatosResponse as any).data)) {
        candidatosList = (candidatosResponse as any).data
        totalCount = (candidatosResponse as any).total || candidatosList.length
      } else if ((candidatosResponse as any).candidatos && Array.isArray((candidatosResponse as any).candidatos)) {
        candidatosList = (candidatosResponse as any).candidatos
        totalCount = (candidatosResponse as any).total || candidatosList.length
      } else {
        const values = Object.values(candidatosResponse as any)
        if (values.length > 0 && Array.isArray(values[0])) {
          candidatosList = values[0] as any[]
        }
      }
    }
    
    if (Array.isArray(candidatosList) && candidatosList.length > 0) {
      const allCandidatos = candidatosList.map((c: any) => ({
        id_anonimo: c.id_anonimo || c.id,
        area_atuacao: c.area_atuacao,
        estado: c.estado,
        cidade: c.cidade,
      }))
      setCandidatos(allCandidatos)
      const totalCandidatos = totalCount || candidatosList.length
      const totalPags = Math.ceil(totalCandidatos / CANDIDATOS_POR_PAGINA)
      setTotalPaginas(totalPags)
      setStats(prev => ({
        ...prev,
        totalCandidatos: totalCandidatos,
      }))
    } else {
      setCandidatos([])
      setTotalPaginas(1)
    }
  }

  const carregarCandidatosComFiltros = async () => {
    try {
      setIsLoading(true)
      setPaginaAtual(1) // Reset para primeira página ao filtrar
      
      // Constrói os parâmetros de query
      const params = new URLSearchParams()
      if (filtroEstado) params.append("estado", filtroEstado)
      if (filtroCidade) params.append("cidade", filtroCidade)
      if (filtroIsPcd !== null) params.append("is_pcd", String(filtroIsPcd))
      if (filtroHabilidade) params.append("habilidade", filtroHabilidade)
      params.append("skip", "0")
      params.append("limit", String(CANDIDATOS_POR_PAGINA))
      
      const query = params.toString()
      const url = `/api/v1/companies/candidatos-anonimos?${query}`
      const candidatosResponse = await api.get(url)
      
      let candidatosList = []
      let totalCount = 0
      if (candidatosResponse && typeof candidatosResponse === 'object') {
        if (Array.isArray(candidatosResponse)) {
          candidatosList = candidatosResponse
        } else if ((candidatosResponse as any).data && Array.isArray((candidatosResponse as any).data)) {
          candidatosList = (candidatosResponse as any).data
          totalCount = (candidatosResponse as any).total || candidatosList.length
        } else if ((candidatosResponse as any).candidatos && Array.isArray((candidatosResponse as any).candidatos)) {
          candidatosList = (candidatosResponse as any).candidatos
          totalCount = (candidatosResponse as any).total || candidatosList.length
        } else {
          const values = Object.values(candidatosResponse as any)
          if (values.length > 0 && Array.isArray(values[0])) {
            candidatosList = values[0] as any[]
          }
        }
      }
      
      if (Array.isArray(candidatosList)) {
        const allCandidatos = candidatosList.map((c: any) => ({
          id_anonimo: c.id_anonimo || c.id,
          area_atuacao: c.area_atuacao,
          estado: c.estado,
          cidade: c.cidade,
        }))
        setCandidatos(allCandidatos)
        const totalPags = Math.ceil((totalCount || allCandidatos.length) / CANDIDATOS_POR_PAGINA)
        setTotalPaginas(totalPags)
        setStats(prev => ({
          ...prev,
          totalCandidatos: totalCount || allCandidatos.length,
        }))
        
        if (allCandidatos.length === 0) {
          toast({
            title: "Sem resultados",
            description: "Nenhum candidato encontrado com esses filtros",
            variant: "default",
          })
        } else {
          toast({
            title: "Sucesso",
            description: `${allCandidatos.length} candidatos encontrados`,
          })
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erro ao buscar candidatos"
      console.error("Erro ao buscar candidatos:", error)
      
      if (!errorMsg.includes("401")) {
        toast({
          title: "Erro",
          description: errorMsg,
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const carregarPipeline = async () => {
    try {
      const response = await api.get("/api/v1/pipeline/meus-candidatos")
      const data = (response as any).data || response
      if (Array.isArray(data)) {
        setPipeline(data)
        toast({
          title: "Sucesso",
          description: "Pipeline carregado com sucesso!",
        })
      } else {
        setPipeline([])
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar pipeline"
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Erro ao carregar pipeline:", error)
      setPipeline([])
    }
  }

  const agendarEntrevista = async () => {
    if (!selectedCandidate || !dataEntrevista) return
    try {
      setIsProcessing(`${selectedCandidate.candidate_id}-entrevista`)
      await api.post(`/api/v1/pipeline/candidato/${selectedCandidate.candidate_id}/agendar-entrevista`, {
        data_entrevista: dataEntrevista,
        job_id: selectedCandidate.job_id,
      })
      setModalOpen(false)
      setDataEntrevista("")
      setSelectedCandidate(null)
      toast({
        title: "Sucesso",
        description: "Entrevista agendada com sucesso!",
      })
      carregarPipeline()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao agendar entrevista"
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Erro ao agendar entrevista:", error)
    } finally {
      setIsProcessing(null)
    }
  }

  const marcarContratacao = async (candidateId: number, jobId: number, resultado: boolean) => {
    try {
      setIsProcessing(`${candidateId}-resultado`)
      await api.post(`/api/v1/pipeline/candidato/${candidateId}/marcar-resultado`, {
        resultado,
        job_id: jobId,
      })
      toast({
        title: "Sucesso",
        description: resultado ? "Candidato contratado!" : "Candidato rejeitado",
      })
      carregarPipeline()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao marcar resultado"
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Erro ao marcar resultado:", error)
    } finally {
      setIsProcessing(null)
    }
  }

  const filtrarPorStatus = () => {
    if (activeTab === "interesse") {
      return pipeline.filter(p => !p.data_entrevista)
    } else if (activeTab === "entrevistas") {
      return pipeline.filter(p => p.data_entrevista && p.resultado === undefined)
    } else {
      return pipeline.filter(p => p.resultado !== undefined)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      aberta: "bg-green-100 text-green-800",
      fechada: "bg-red-100 text-red-800",
      rascunho: "bg-yellow-100 text-yellow-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao seu painel de controle</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Vagas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.totalVagas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Vagas Abertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.vagasAbertas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Candidatos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalCandidatos}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="recentes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recentes">Vagas Recentes</TabsTrigger>
              <TabsTrigger value="candidatos">Todos os Candidatos</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
            </TabsList>

            {/* Vagas Recentes Tab */}
            <TabsContent value="recentes" className="mt-4">
              {vagas.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">Nenhuma vaga criada ainda</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {vagas.map((vaga: any) => (
                    <Card 
                      key={vaga.id} 
                      className="overflow-hidden hover:shadow-lg transition cursor-pointer"
                      onClick={() => router.push(`/empresa/jobs/${vaga.id}`)}
                    >
                      <CardContent className="p-0">
                        <div className="p-6">
                          {/* Header com Título e Status */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {vaga.title || vaga.titulo || "Vaga sem título"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {vaga.location || "Localização não especificada"}
                              </p>
                            </div>
                            <Badge className={getStatusColor(vaga.status)}>
                              {vaga.status === "aberta" ? "Aberta" : vaga.status === "fechada" ? "Fechada" : "Rascunho"}
                            </Badge>
                          </div>

                          {/* Descrição */}
                          {(vaga.description || vaga.descricao) && (
                            <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                              {vaga.description || vaga.descricao}
                            </p>
                          )}

                          {/* Info Cards */}
                          <div className="grid grid-cols-4 gap-3 mb-4 pt-4 border-t border-gray-200">
                            {/* Salário */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-600 font-medium mb-1">Salário</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {vaga.salary_min && vaga.salary_max
                                  ? `R$ ${parseFloat(vaga.salary_min).toLocaleString("pt-BR")} - R$ ${parseFloat(vaga.salary_max).toLocaleString("pt-BR")}`
                                  : "A negociar"}
                              </p>
                            </div>

                            {/* Tipo de Contrato */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-600 font-medium mb-1">Tipo</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {vaga.job_type || "Não especificado"}
                              </p>
                            </div>

                            {/* Candidatos */}
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <p className="text-xs text-blue-600 font-medium mb-1">Candidatos</p>
                              <p className="text-sm font-semibold text-blue-900">{vaga.applications_count || 0}</p>
                            </div>

                            {/* Visualizações */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-600 font-medium mb-1">Visualizações</p>
                              <p className="text-sm font-semibold text-gray-900">{vaga.views_count || 0}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-4 border-t border-gray-200">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/empresa/jobs/${vaga.id}`)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              Visualizar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/empresa/jobs/${vaga.id}?edit=true`)
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2 text-red-600 hover:text-red-700 border-red-200"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                              Deletar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Pipeline Tab */}
            {/* Todos os Candidatos Tab */}
            <TabsContent value="candidatos" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Todos os Candidatos ({candidatos.length})</CardTitle>
                </CardHeader>
                
                {/* Filtros */}
                <CardContent className="border-b pb-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Estado</label>
                      <Input
                        placeholder="Ex: SP"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Cidade</label>
                      <Input
                        placeholder="Ex: São Paulo"
                        value={filtroCidade}
                        onChange={(e) => setFiltroCidade(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Habilidade</label>
                      <Input
                        placeholder="Ex: JavaScript"
                        value={filtroHabilidade}
                        onChange={(e) => setFiltroHabilidade(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <Button
                        size="sm"
                        onClick={() => carregarCandidatosComFiltros()}
                        className="flex-1"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Filtrar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFiltroEstado("")
                          setFiltroCidade("")
                          setFiltroHabilidade("")
                          setFiltroIsPcd(null)
                          fetchDashboardData()
                        }}
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>
                </CardContent>
                
                <CardContent className="pt-4">
                  {isLoading ? (
                    <p className="text-gray-500 text-center py-8">Carregando candidatos...</p>
                  ) : candidatos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum candidato encontrado. Crie uma vaga para receber candidatos!</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ID Anônimo</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Localização</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Área de Atuação</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {candidatos.map((candidato) => (
                            <tr key={candidato.id_anonimo} className="hover:bg-gray-50 transition">
                              <td className="px-4 py-3 text-sm text-gray-700">
                                <Badge variant="outline">{candidato.id_anonimo}</Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {candidato.cidade && candidato.estado 
                                  ? `${candidato.cidade}, ${candidato.estado}`
                                  : candidato.estado || candidato.cidade || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">{candidato.area_atuacao || "-"}</td>
                              <td className="px-4 py-3 text-sm">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push(`/empresa/candidatos/${candidato.id_anonimo}`)}
                                  className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-400"
                                >
                                  Ver Detalhes
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Paginação */}
                  {candidatos.length > 0 && totalPaginas > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        Página <span className="font-semibold">{paginaAtual}</span> de <span className="font-semibold">{totalPaginas}</span> 
                        ({stats.totalCandidatos} candidatos no total)
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (paginaAtual > 1) {
                              setPaginaAtual(paginaAtual - 1)
                            }
                          }}
                          disabled={paginaAtual === 1 || isLoading}
                        >
                          ← Anterior
                        </Button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                            let pageNum: number
                            if (totalPaginas <= 5) {
                              pageNum = i + 1
                            } else if (paginaAtual <= 3) {
                              pageNum = i + 1
                            } else if (paginaAtual >= totalPaginas - 2) {
                              pageNum = totalPaginas - 4 + i
                            } else {
                              pageNum = paginaAtual - 2 + i
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                size="sm"
                                variant={paginaAtual === pageNum ? "default" : "outline"}
                                onClick={() => setPaginaAtual(pageNum)}
                                disabled={isLoading}
                              >
                                {pageNum}
                              </Button>
                            )
                          })}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (paginaAtual < totalPaginas) {
                              setPaginaAtual(paginaAtual + 1)
                            }
                          }}
                          disabled={paginaAtual === totalPaginas || isLoading}
                        >
                          Próxima →
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Kanban Tab */}
            <TabsContent value="kanban" className="mt-4">
              <div className="space-y-6">
                {/* Filtros */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Filtros por Candidato</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Escolaridade</label>
                        <Input 
                          placeholder="Ex: Ensino Médio"
                          value={filtroHabilidade}
                          onChange={(e) => setFiltroHabilidade(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Gênero</label>
                        <select className="w-full px-3 py-2 border rounded-md text-sm h-9">
                          <option value="">Todos</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">PCD</label>
                        <select 
                          className="w-full px-3 py-2 border rounded-md text-sm h-9"
                          value={filtroIsPcd === null ? "" : filtroIsPcd ? "sim" : "nao"}
                          onChange={(e) => {
                            if (e.target.value === "sim") setFiltroIsPcd(true)
                            else if (e.target.value === "nao") setFiltroIsPcd(false)
                            else setFiltroIsPcd(null)
                          }}
                        >
                          <option value="">Todos</option>
                          <option value="sim">Com PCD</option>
                          <option value="nao">Sem PCD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Experiência</label>
                        <Input 
                          placeholder="Ex: 2+ anos"
                          value={filtroExperiencia}
                          onChange={(e) => setFiltroExperiencia(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Área de Atuação</label>
                        <Input 
                          placeholder="Ex: Elétrica"
                          value={filtroAreaAtuacao}
                          onChange={(e) => setFiltroAreaAtuacao(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full h-9"
                          onClick={() => {
                            setFiltroEstado("")
                            setFiltroCidade("")
                            setFiltroIsPcd(null)
                            setFiltroHabilidade("")
                            setFiltroGenero("")
                            setFiltroExperiencia("")
                            setFiltroAreaAtuacao("")
                          }}
                        >
                          🔄 Limpar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vagas com Pipeline */}
                {allVagas.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500">Nenhuma vaga criada ainda</p>
                    </CardContent>
                  </Card>
                ) : (
                  allVagas.map((vaga) => (
                    <Card key={vaga.id} className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{vaga.titulo}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">Vagas gerenciadas e candidatos em progresso</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(vaga.status)}>
                              {vaga.status === "aberta" ? "Aberta" : vaga.status === "fechada" ? "Fechada" : "Rascunho"}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => router.push(`/empresa/kanban-vaga`)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Ver Kanban Detalhado
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-4 gap-4">
                          {/* Coluna: Total de Candidatos */}
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                            <div className="text-sm text-blue-700 font-medium mb-2">Total de Candidatos</div>
                            <div className="text-3xl font-bold text-blue-900">{vaga.candidatos_count}</div>
                            <p className="text-xs text-blue-600 mt-2">candidatos interessados</p>
                          </div>

                          {/* Coluna: Candidatos Convidados */}
                          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                            <div className="text-sm text-yellow-700 font-medium mb-2">Convidados</div>
                            <div className="text-3xl font-bold text-yellow-900">0</div>
                            <p className="text-xs text-yellow-600 mt-2">convites enviados</p>
                          </div>

                          {/* Coluna: Candidatos em Entrevista */}
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                            <div className="text-sm text-orange-700 font-medium mb-2">Em Entrevista</div>
                            <div className="text-3xl font-bold text-orange-900">0</div>
                            <p className="text-xs text-orange-600 mt-2">em fase de entrevista</p>
                          </div>

                          {/* Coluna: Candidatos Contratados */}
                          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                            <div className="text-sm text-green-700 font-medium mb-2">Contratados</div>
                            <div className="text-3xl font-bold text-green-900">0</div>
                            <p className="text-xs text-green-600 mt-2">candidatos contratados</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
