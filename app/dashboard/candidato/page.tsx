"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
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
} from "lucide-react"
import { mockVagas, mockCandidaturas, mockUsers } from "@/lib/mock-data"
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
      loadData()
    }
  }, [user, isLoading, router])

  const loadData = async () => {
    if (!user) return

    try {
      setLoadingData(true)
      // #colocarRota - Ajuste a rota conforme seu backend
      const [vagasData, candidaturasData] = await Promise.all([
        api.get<Vaga[]>("/vagas/abertas").catch(() => {
          console.warn("Erro ao carregar vagas, usando dados mockados")
          return mockVagas
        }),
        api.get<Candidatura[]>(`/candidaturas?candidatoId=${user.id}`).catch(() => {
          console.warn("Erro ao carregar candidaturas, usando dados mockados")
          return mockCandidaturas.filter((c) => c.candidatoId === user.id)
        }),
      ])

      setVagas(Array.isArray(vagasData) ? vagasData : mockVagas)
      setCandidaturas(Array.isArray(candidaturasData) ? candidaturasData : [])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      // Fallback para dados mockados em caso de erro
      setVagas(mockVagas)
      setCandidaturas(mockCandidaturas.filter((c) => c.candidatoId === user?.id))
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
      vaga.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.localizacao.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCandidatar = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedVaga || !user) return

    try {
      // #colocarRota - Ajuste a rota conforme seu backend
      const novaCandidatura = await api.post<Candidatura>("/candidaturas", {
        vagaId: selectedVaga.id,
        candidatoId: user.id,
        mensagem: mensagem || undefined,
      })

      setCandidaturas([...candidaturas, novaCandidatura])
      setMensagem("")
      setSelectedVaga(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao candidatar-se:", error)
      alert("Erro ao enviar candidatura. Tente novamente.")
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
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <DashboardHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Painel do Candidato</h2>
              <p className="text-muted-foreground">Encontre vagas e acompanhe suas candidaturas</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/candidato/perfil">Meu Perfil</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/candidato/autoavaliacao">Autoavaliação</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/candidato/testes">Testes</Link>
              </Button>
            </div>
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
                  const empresa = mockUsers.find((u) => u.id === vaga.empresaId)
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
                                {empresa?.nome}
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
                          <Button
                            onClick={() => {
                              setSelectedVaga(vaga)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Candidatar
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
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
                  const empresa = mockUsers.find((u) => u.id === vaga?.empresaId)
                  return (
                    <Card key={candidatura.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{vaga?.titulo}</CardTitle>
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
                                {empresa?.nome}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {vaga?.localizacao}
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
  )
}
