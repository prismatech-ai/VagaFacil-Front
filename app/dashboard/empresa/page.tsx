"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Briefcase, Users, Eye, Edit, Trash2, MapPin, DollarSign } from "lucide-react"
import { mockVagas, mockCandidaturas, mockUsers } from "@/lib/mock-data"
import type { Vaga } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EmpresaDashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [vagas, setVagas] = useState(mockVagas)
  const [candidaturas, setCandidaturas] = useState(mockCandidaturas)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form state
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [requisitos, setRequisitos] = useState("")
  const [salario, setSalario] = useState("")
  const [localizacao, setLocalizacao] = useState("")
  const [tipo, setTipo] = useState<"CLT" | "PJ" | "Estágio" | "Temporário">("CLT")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role !== "empresa") {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== "empresa") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const minhasVagas = vagas.filter((v) => v.empresaId === user.id)
  const vagasAbertas = minhasVagas.filter((v) => v.status === "aberta")

  const minhasCandidaturas = candidaturas.filter((c) => {
    const vaga = vagas.find((v) => v.id === c.vagaId)
    return vaga?.empresaId === user.id
  })

  const handleCreateVaga = (e: React.FormEvent) => {
    e.preventDefault()

    const novaVaga: Vaga = {
      id: Date.now().toString(),
      empresaId: user.id,
      titulo,
      descricao,
      requisitos,
      salario: salario || undefined,
      localizacao,
      tipo,
      status: "aberta",
      createdAt: new Date(),
    }

    setVagas([...vagas, novaVaga])
    mockVagas.push(novaVaga)

    // Reset form
    setTitulo("")
    setDescricao("")
    setRequisitos("")
    setSalario("")
    setLocalizacao("")
    setTipo("CLT")
    setIsDialogOpen(false)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      aberta: "default",
      fechada: "secondary",
      pendente: "outline",
      em_analise: "secondary",
      aprovado: "default",
      rejeitado: "destructive",
    }
    return variants[status] || "outline"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      aberta: "Aberta",
      fechada: "Fechada",
      pendente: "Pendente",
      em_analise: "Em Análise",
      aprovado: "Aprovado",
      rejeitado: "Rejeitado",
    }
    return labels[status] || status
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <DashboardHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Painel da Empresa</h2>
            <p className="text-muted-foreground">Gerencie suas vagas e candidatos</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Vaga
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Publicar Nova Vaga</DialogTitle>
                <DialogDescription>Preencha os detalhes da vaga que deseja publicar</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateVaga} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título da Vaga *</Label>
                  <Input
                    id="titulo"
                    placeholder="Ex: Desenvolvedor Full Stack"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva as responsabilidades e o que a pessoa fará no dia a dia..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requisitos">Requisitos *</Label>
                  <Textarea
                    id="requisitos"
                    placeholder="Liste os requisitos necessários para a vaga..."
                    value={requisitos}
                    onChange={(e) => setRequisitos(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Contrato *</Label>
                    <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLT">CLT</SelectItem>
                        <SelectItem value="PJ">PJ</SelectItem>
                        <SelectItem value="Estágio">Estágio</SelectItem>
                        <SelectItem value="Temporário">Temporário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salario">Faixa Salarial</Label>
                    <Input
                      id="salario"
                      placeholder="Ex: R$ 5.000 - R$ 8.000"
                      value={salario}
                      onChange={(e) => setSalario(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="localizacao">Localização *</Label>
                  <Input
                    id="localizacao"
                    placeholder="Ex: São Paulo - SP (Remoto)"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Publicar Vaga</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vagas Publicadas</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{minhasVagas.length}</div>
              <p className="text-xs text-muted-foreground">{vagasAbertas.length} abertas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidaturas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{minhasCandidaturas.length}</div>
              <p className="text-xs text-muted-foreground">Total recebidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {minhasCandidaturas.filter((c) => c.status === "pendente").length}
              </div>
              <p className="text-xs text-muted-foreground">Aguardando análise</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vagas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vagas">Minhas Vagas</TabsTrigger>
            <TabsTrigger value="candidaturas">Candidaturas</TabsTrigger>
          </TabsList>

          {/* Tab de Vagas */}
          <TabsContent value="vagas" className="space-y-4">
            {minhasVagas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma vaga publicada</h3>
                  <p className="text-muted-foreground text-center mb-4">Comece publicando sua primeira vaga</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Publicar Vaga
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {minhasVagas.map((vaga) => {
                  const candidaturasVaga = candidaturas.filter((c) => c.vagaId === vaga.id)
                  return (
                    <Card key={vaga.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle>{vaga.titulo}</CardTitle>
                              <Badge variant={getStatusBadge(vaga.status)}>{getStatusLabel(vaga.status)}</Badge>
                              <Badge variant="outline">{vaga.tipo}</Badge>
                            </div>
                            <CardDescription className="flex flex-wrap gap-3 text-sm">
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
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {candidaturasVaga.length} candidatos
                              </span>
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">{vaga.descricao}</p>
                        <div className="text-sm">
                          <p className="font-medium mb-1">Requisitos:</p>
                          <p className="text-muted-foreground">{vaga.requisitos}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Tab de Candidaturas */}
          <TabsContent value="candidaturas" className="space-y-4">
            {minhasCandidaturas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma candidatura ainda</h3>
                  <p className="text-muted-foreground text-center">
                    Quando candidatos se inscreverem nas suas vagas, eles aparecerão aqui
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {minhasCandidaturas.map((candidatura) => {
                  const vaga = vagas.find((v) => v.id === candidatura.vagaId)
                  const candidato = mockUsers.find((u) => u.id === candidatura.candidatoId)
                  return (
                    <Card key={candidatura.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{candidato?.nome}</CardTitle>
                              <Badge variant={getStatusBadge(candidatura.status)}>
                                {getStatusLabel(candidatura.status)}
                              </Badge>
                            </div>
                            <CardDescription>Candidatura para: {vaga?.titulo}</CardDescription>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Perfil
                          </Button>
                        </div>
                      </CardHeader>
                      {candidatura.mensagem && (
                        <CardContent>
                          <p className="text-sm font-medium mb-1">Mensagem do candidato:</p>
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
    </div>
  )
}
