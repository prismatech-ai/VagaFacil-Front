"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { CandidatoSidebar } from "@/components/candidato-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Building2,
  Send,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Lock,
} from "lucide-react"
import type { Vaga, Candidatura } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

export default function CandidatoDashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [loadingData, setLoadingData] = useState(true)
  const [testesCompletos, setTestesCompletos] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role !== "candidato") {
      router.push("/dashboard")
      return
    }

    if (user && user.role === "candidato") {
      // Verificar status dos testes
      const testeConcluido = localStorage.getItem("testeConcluido") === "true"
      const autoavaliacaoConcluida = localStorage.getItem("autoavaliacaoConcluida") === "true"
      setTestesCompletos(testeConcluido && autoavaliacaoConcluida)
      
      loadData()
    }
  }, [user, isLoading, router])

  const loadData = async () => {
    if (!user) return

    try {
      setLoadingData(true)

      // Fetch vagas públicas
      const vagasResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/disponibles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      let vagasData: any[] = []
      if (vagasResponse.ok) {
        vagasData = await vagasResponse.json()
        console.log("Vagas recebidas:", vagasData)
      } else {
        const errorText = await vagasResponse.text()
        console.error("Erro ao carregar vagas:", vagasResponse.status, errorText)
      }

      const formattedVagas: Vaga[] = (vagasData || []).map((v: any) => ({
        id: v.id,
        empresaId: v.company_id,
        empresaNome: v.company_name || 'Empresa',
        titulo: v.title || '',
        descricao: v.description || '',
        requisitos: v.requirements || '',
        tipo: v.job_type || 'CLT',
        localizacao: v.location || '',
        salario: v.salary_min && v.salary_max ? `${v.salary_min} - ${v.salary_max} ${v.salary_currency || 'BRL'}` : '',
        status: v.status,
        createdAt: v.created_at ? new Date(v.created_at) : new Date(),
      }))

      setVagas(formattedVagas.filter(v => v.status === 'aberta'))

      // Fetch candidaturas do candidato (requer autenticação)
      const token = localStorage.getItem("token")
      
      if (token) {
        const candidaturasResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/minhas-candidaturas`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        let candidaturasData: any[] = []
        if (candidaturasResponse.ok) {
          candidaturasData = await candidaturasResponse.json()
          console.log("Candidaturas recebidas:", candidaturasData)
        } else {
          const errorText = await candidaturasResponse.text()
          console.error("Erro ao carregar candidaturas:", candidaturasResponse.status, errorText)
        }

        const formattedCandidaturas: Candidatura[] = (candidaturasData || []).map((c: any) => ({
          id: c.candidatura_id,
          vagaId: c.vaga?.id,
          candidatoId: user.id,
          mensagem: c.mensagem || '',
          status: c.status || 'pendente',
          createdAt: c.data_candidatura ? new Date(c.data_candidatura) : new Date(),
        }))

        setCandidaturas(formattedCandidaturas)
        
        // Atualizar vagas com dados da resposta
        const vagasDoEndpoint = candidaturasData.map((c: any) => ({
          id: c.vaga.id,
          empresaId: c.vaga.empresa_id || '',
          empresaNome: c.vaga.empresa || 'Empresa',
          titulo: c.vaga.titulo || '',
          descricao: '',
          requisitos: '',
          tipo: c.vaga.tipo_contrato || 'CLT',
          localizacao: c.vaga.localizacao || '',
          salario: '',
          status: c.vaga.status_vaga || 'aberta',
          createdAt: c.vaga.criada_em ? new Date(c.vaga.criada_em) : new Date(),
        }))

        // Mesclar vagas existentes com as do endpoint de candidaturas
        setVagas((prevVagas) => {
          const vagasMap = new Map(prevVagas.map(v => [v.id, v]))
          vagasDoEndpoint.forEach((v: any) => {
            if (!vagasMap.has(v.id)) {
              vagasMap.set(v.id, v)
            }
          })
          return Array.from(vagasMap.values())
        })
      } else {
        setCandidaturas([])
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      setVagas([])
      setCandidaturas([])
    } finally {
      setLoadingData(false)
    }
  }

  if (isLoading || !user || user.role !== "candidato" || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const vagasAbertas = vagas.filter((v) => v.status === "aberta")
  const minhasCandidaturas = candidaturas.filter((c) => c.candidatoId === user.id)

  const vagasJaCandidatadas = minhasCandidaturas.map((c) => c.vagaId)
  const vagasDisponiveis = vagasAbertas.filter((v) => !vagasJaCandidatadas.includes(v.id))

  const filteredVagas = vagasDisponiveis.filter(
    (vaga) =>
      (vaga.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vaga.descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vaga.localizacao || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenCandidaturaDialog = async (vaga: Vaga) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/publico/${vaga.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`,
        },
      })

      if (response.ok) {
        const vagaDetalhes = await response.json()
        console.log("Detalhes da vaga:", vagaDetalhes)
        
        const vagaFormatada: Vaga = {
          id: vagaDetalhes.id,
          empresaId: vagaDetalhes.company_id,
          empresaNome: vagaDetalhes.company_name || 'Empresa',
          titulo: vagaDetalhes.title || '',
          descricao: vagaDetalhes.description || '',
          requisitos: vagaDetalhes.requirements || '',
          tipo: vagaDetalhes.job_type || 'CLT',
          localizacao: vagaDetalhes.location || '',
          salario: vagaDetalhes.salary_min && vagaDetalhes.salary_max ? `${vagaDetalhes.salary_min} - ${vagaDetalhes.salary_max} ${vagaDetalhes.salary_currency || 'BRL'}` : '',
          status: vagaDetalhes.status,
          createdAt: vagaDetalhes.created_at ? new Date(vagaDetalhes.created_at) : new Date(),
        }
        
        setSelectedVaga(vagaFormatada)
        setIsDialogOpen(true)
      } else {
        console.error("Erro ao carregar detalhes da vaga:", response.status)
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes da vaga:", error)
    }
  }

  const handleCandidatar = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedVaga || !user) return

    try {
      const token = localStorage.getItem("token")
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          job_id: selectedVaga.id,
          message: mensagem || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || "Erro ao enviar candidatura")
      }

      const novaCandidatura = await response.json()

      const formattedCandidatura: Candidatura = {
        id: novaCandidatura.id,
        vagaId: novaCandidatura.job_id || novaCandidatura.vaga_id || novaCandidatura.vagaId,
        candidatoId: novaCandidatura.candidate_id || novaCandidatura.candidato_id || novaCandidatura.candidatoId || user.id,
        mensagem: novaCandidatura.message || novaCandidatura.mensagem || '',
        status: novaCandidatura.status || 'pendente',
        createdAt: novaCandidatura.created_at ? new Date(novaCandidatura.created_at) : new Date(),
      }

      setCandidaturas([...candidaturas, formattedCandidatura])
      setMensagem("")
      setSelectedVaga(null)
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Erro ao candidatar-se:", error)
      if (error.message?.includes("já")) {
        alert("Você já se candidatou a esta vaga.")
      } else {
        alert("Erro ao enviar candidatura. Tente novamente.")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pendente: "outline",
      em_analise: "secondary",
      aprovado: "default",
      rejeitado: "destructive",
    }
    return variants[status] || "outline"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: "Pendente",
      em_analise: "Em Análise",
      aprovado: "Aprovado",
      rejeitado: "Rejeitado",
    }
    return labels[status] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <Clock className="h-4 w-4" />
      case "em_analise":
        return <FileText className="h-4 w-4" />
      case "aprovado":
        return <CheckCircle2 className="h-4 w-4" />
      case "rejeitado":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <SidebarProvider>
      <CandidatoSidebar />
      <div className="min-h-screen flex flex-col bg-secondary/30 w-full">
        <DashboardHeader />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Painel do Candidato</h2>
              <p className="text-muted-foreground">Encontre vagas e acompanhe suas candidaturas</p>
            </div>
          </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vagas Disponíveis</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vagasDisponiveis.length}</div>
              <p className="text-xs text-muted-foreground">Vagas abertas para candidatura</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minhas Candidaturas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{minhasCandidaturas.length}</div>
              <p className="text-xs text-muted-foreground">Total de candidaturas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {minhasCandidaturas.filter((c) => c.status === "pendente" || c.status === "em_analise").length}
              </div>
              <p className="text-xs text-muted-foreground">Aguardando resposta</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vagas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vagas">Vagas Disponíveis</TabsTrigger>
            <TabsTrigger value="candidaturas">Minhas Candidaturas</TabsTrigger>
          </TabsList>

          {/* Tab de Vagas Disponíveis */}
          <TabsContent value="vagas" className="space-y-4">
            {/* Barra de Pesquisa */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar vagas por título, descrição ou localização..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lista de Vagas */}
            {filteredVagas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? "Nenhuma vaga encontrada" : "Nenhuma vaga disponível"}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm
                      ? "Tente buscar com outros termos"
                      : "Novas vagas aparecerão aqui quando forem publicadas"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredVagas.map((vaga) => {
                  return (
                    <Card key={vaga.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle>{vaga.titulo}</CardTitle>
                              <Badge variant="outline">{vaga.tipo}</Badge>
                            </div>
                            <CardDescription className="flex flex-wrap gap-3 text-sm">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {vaga.empresaNome || 'Empresa'}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {vaga.localizacao}
                              </span>
                              {vaga.salario && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {vaga.salario}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          {!testesCompletos ? (
                            <Button disabled className="opacity-50 cursor-not-allowed">
                              <Lock className="mr-2 h-4 w-4" />
                              Testes Obrigatórios
                            </Button>
                          ) : (
                            <Button onClick={() => handleOpenCandidaturaDialog(vaga)}>
                              <Send className="mr-2 h-4 w-4" />
                              Candidatar
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {!testesCompletos && (
                          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                              <strong>⚠️ Atenção:</strong> Você precisa completar todos os testes no seu onboarding para poder se candidatar a vagas. 
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 h-auto font-semibold text-amber-900 hover:text-amber-950"
                                onClick={() => router.push("/dashboard/candidato/onboarding")}
                              >
                                Clique aqui para completar.
                              </Button>
                            </p>
                          </div>
                        )}
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Descrição:</p>
                            <p className="text-sm text-muted-foreground">{vaga.descricao}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Requisitos:</p>
                            <p className="text-sm text-muted-foreground">{vaga.requisitos}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Tab de Minhas Candidaturas */}
          <TabsContent value="candidaturas" className="space-y-4">
            {minhasCandidaturas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma candidatura ainda</h3>
                  <p className="text-muted-foreground text-center mb-4">Comece se candidatando às vagas disponíveis</p>
                  <Button onClick={() => document.querySelector<HTMLButtonElement>('[value="vagas"]')?.click()}>
                    Ver Vagas Disponíveis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {minhasCandidaturas.map((candidatura) => {
                  const vaga = vagas.find((v) => v.id === candidatura.vagaId)
                  return (
                    <Card key={candidatura.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{vaga?.titulo || 'Vaga'}</CardTitle>
                              <Badge variant={getStatusBadge(candidatura.status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(candidatura.status)}
                                  {getStatusLabel(candidatura.status)}
                                </span>
                              </Badge>
                            </div>
                            <CardDescription className="flex flex-wrap gap-3 text-sm">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {vaga?.empresaNome || 'Empresa'}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {vaga?.localizacao || '-'}
                              </span>
                              <span className="text-muted-foreground">
                                Candidatura enviada em {candidatura.createdAt.toLocaleDateString("pt-BR")}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      {candidatura.mensagem && (
                        <CardContent>
                          <p className="text-sm font-medium mb-1">Sua mensagem:</p>
                          <p className="text-sm text-muted-foreground">{candidatura.mensagem}</p>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog de Candidatura */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Candidatar-se à Vaga</DialogTitle>
            <DialogDescription>{selectedVaga?.titulo}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCandidatar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem para a empresa (opcional)</Label>
              <Textarea
                id="mensagem"
                placeholder="Conte por que você é o candidato ideal para esta vaga..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" />
                Enviar Candidatura
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </SidebarProvider>
  )
}
