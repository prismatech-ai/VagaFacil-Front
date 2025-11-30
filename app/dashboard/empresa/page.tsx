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
import { Plus, Briefcase, Users, Eye, Edit, Trash2, MapPin, DollarSign, CheckCircle2, X } from "lucide-react"
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
import { api } from "@/lib/api"

export default function EmpresaDashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [candidaturas, setCandidaturas] = useState(mockCandidaturas)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // Form state
  const [titulo, setTitulo] = useState("")
  const [senha, setSenha] = useState("")
  const [descricao, setDescricao] = useState("")
  const [requisitos, setRequisitos] = useState("")
  const [tipoVaga, setTipoVaga] = useState("")
  const [disciplina, setDisciplina] = useState("")
  const [nivel, setNivel] = useState<"Júnior" | "Pleno" | "Sênior" | "Especialista" | "">("")
  const [escolaridade, setEscolaridade] = useState<"Ensino Fundamental" | "Ensino Médio" | "Nível técnico" | "Superior" | "Pós-graduação" | "">("")
  const [experienciaMinima, setExperienciaMinima] = useState("")
  const [salario, setSalario] = useState("")
  const [localizacao, setLocalizacao] = useState("")
  const [tipo, setTipo] = useState<"CLT" | "PJ" | "Estágio" | "Temporário">("CLT")
  const [beneficios, setBeneficios] = useState<string[]>([])
  const [beneficioInput, setBeneficioInput] = useState("")
  const [vagaCriada, setVagaCriada] = useState<Vaga | null>(null)
  const [showConfirmacao, setShowConfirmacao] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role !== "empresa") {
      router.push("/dashboard")
      return
    }

    if (user && user.role === "empresa") {
      loadData()
    }
  }, [user, isLoading, router])

  const loadData = async () => {
    if (!user) return

    try {
      setLoadingData(true)
      // #colocarRota - Ajuste as rotas conforme seu backend
      const [vagasData, candidaturasData] = await Promise.all([
        api.get<Vaga[]>(`/vagas?empresaId=${user.id}`).catch(() => {
          console.warn("Erro ao carregar vagas, usando dados mockados")
          return mockVagas.filter((v) => v.empresaId === user.id)
        }),
        api.get(`/candidaturas?empresaId=${user.id}`).catch(() => {
          console.warn("Erro ao carregar candidaturas, usando dados mockados")
          return mockCandidaturas.filter((c) => {
            const vaga = mockVagas.find((v) => v.id === c.vagaId)
            return vaga?.empresaId === user.id
          })
        }),
      ])

      setVagas(Array.isArray(vagasData) ? vagasData : [])
      setCandidaturas(Array.isArray(candidaturasData) ? candidaturasData : [])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      // Fallback para dados mockados
      setVagas(mockVagas.filter((v) => v.empresaId === user?.id))
      setCandidaturas(mockCandidaturas.filter((c) => {
        const vaga = mockVagas.find((v) => v.id === c.vagaId)
        return vaga?.empresaId === user?.id
      }))
    } finally {
      setLoadingData(false)
    }
  }

  if (isLoading || !user || user.role !== "empresa" || loadingData) {
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

  const addBeneficio = () => {
    if (beneficioInput.trim() && !beneficios.includes(beneficioInput.trim())) {
      setBeneficios([...beneficios, beneficioInput.trim()])
      setBeneficioInput("")
    }
  }

  const removeBeneficio = (beneficio: string) => {
    setBeneficios(beneficios.filter((b) => b !== beneficio))
  }

  const handleCreateVaga = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      // #colocarRota - Ajuste a rota conforme seu backend
      const novaVaga = await api.post<Vaga>("/vagas", {
        empresaId: user.id,
        senha: senha || undefined,
        titulo,
        descricao,
        requisitos,
        tipoVaga: tipoVaga || undefined,
        disciplina: disciplina || undefined,
        nivel: nivel || undefined,
        escolaridade: escolaridade || undefined,
        experienciaMinima: experienciaMinima || undefined,
        salario: salario || undefined,
        localizacao,
        tipo,
        beneficios: beneficios.length > 0 ? beneficios : undefined,
        status: "aberta",
      })

      setVagas([...vagas, novaVaga])

    // Mostrar página de confirmação
    setVagaCriada(novaVaga)
    setShowConfirmacao(true)
    setIsDialogOpen(false)

    // Reset form
    setTitulo("")
    setSenha("")
    setDescricao("")
    setRequisitos("")
    setTipoVaga("")
    setDisciplina("")
    setNivel("")
    setEscolaridade("")
    setExperienciaMinima("")
    setSalario("")
    setLocalizacao("")
    setTipo("CLT")
    setBeneficios([])
    setBeneficioInput("")
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

      {/* Dialog de Confirmação */}
      {showConfirmacao && vagaCriada && (
        <Dialog open={showConfirmacao} onOpenChange={setShowConfirmacao}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl">EMPRESA – DADOS DA VAGA</DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmacao(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Grid com os dados da vaga */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Coluna Esquerda */}
                <div className="space-y-4">
                  <Card className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">ID</p>
                        <p className="text-lg font-bold">{vagaCriada.id}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {vagaCriada.senha && (
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Senha</p>
                          <p className="text-lg font-bold">{vagaCriada.senha}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {vagaCriada.tipoVaga && (
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Tipo de vaga</p>
                          <p className="text-lg font-bold">{vagaCriada.tipoVaga}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {vagaCriada.disciplina && (
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Disciplina</p>
                          <p className="text-lg font-bold">{vagaCriada.disciplina}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {vagaCriada.nivel && (
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Nível</p>
                          <p className="text-lg font-bold">{vagaCriada.nivel}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {vagaCriada.escolaridade && (
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Escolaridade</p>
                          <p className="text-lg font-bold">{vagaCriada.escolaridade}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Coluna Direita */}
                <div className="space-y-4">
                  {vagaCriada.experienciaMinima && (
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Experiência</p>
                          <p className="text-lg font-bold">{vagaCriada.experienciaMinima}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Local da vaga</p>
                        <p className="text-lg font-bold">{vagaCriada.localizacao}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {vagaCriada.salario && (
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Faixa salarial</p>
                          <p className="text-lg font-bold">{vagaCriada.salario}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {vagaCriada.beneficios && vagaCriada.beneficios.length > 0 && (
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Benefícios</p>
                          <p className="text-lg font-bold">{vagaCriada.beneficios.join(", ")}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Mensagem de Confirmação */}
              <Card className="border-2 border-primary bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-lg font-bold text-primary mb-1">Parabéns!</p>
                      <p className="text-sm">
                        Sua vaga foi cadastrada com <span className="font-bold">sucesso</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setShowConfirmacao(false)}>Fechar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Painel da Empresa</h2>
            <p className="text-muted-foreground">Gerencie suas vagas e candidatos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/empresa/pipeline">Pipeline</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/empresa/banco-talentos">Banco de Talentos</Link>
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Vaga
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Vaga</DialogTitle>
                <DialogDescription>Preencha os dados da vaga conforme solicitado</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateVaga} className="space-y-6">
                {/* Linha 1: Título e Senha */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título da Vaga *</Label>
                    <Input
                      id="titulo"
                      placeholder="Ex: Técnico em Manutenção"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <Input
                      id="senha"
                      type="text"
                      placeholder="Ex: CMPC@2025"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                    />
                  </div>
                </div>

                {/* Linha 2: Tipo de Vaga e Disciplina */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoVaga">Tipo de Vaga</Label>
                    <Select value={tipoVaga} onValueChange={setTipoVaga}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                        <SelectItem value="Operação">Operação</SelectItem>
                        <SelectItem value="Projeto">Projeto</SelectItem>
                        <SelectItem value="Administrativo">Administrativo</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disciplina">Disciplina</Label>
                    <Select value={disciplina} onValueChange={setDisciplina}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mecânica">Mecânica</SelectItem>
                        <SelectItem value="Elétrica">Elétrica</SelectItem>
                        <SelectItem value="Automação">Automação</SelectItem>
                        <SelectItem value="Instrumentação">Instrumentação</SelectItem>
                        <SelectItem value="Caldeiraria e Solda">Caldeiraria e Solda</SelectItem>
                        <SelectItem value="Civil">Civil</SelectItem>
                        <SelectItem value="Outra">Outra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Linha 3: Nível e Escolaridade */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nivel">Nível</Label>
                    <Select value={nivel} onValueChange={(v) => setNivel(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Júnior">Júnior</SelectItem>
                        <SelectItem value="Pleno">Pleno</SelectItem>
                        <SelectItem value="Sênior">Sênior</SelectItem>
                        <SelectItem value="Especialista">Especialista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="escolaridade">Escolaridade</Label>
                    <Select value={escolaridade} onValueChange={(v) => setEscolaridade(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ensino Fundamental">Ensino Fundamental</SelectItem>
                        <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                        <SelectItem value="Nível técnico">Nível técnico</SelectItem>
                        <SelectItem value="Superior">Superior</SelectItem>
                        <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Linha 4: Experiência e Localização */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienciaMinima">Experiência Mínima</Label>
                    <Input
                      id="experienciaMinima"
                      placeholder="Ex: mínima 2 anos"
                      value={experienciaMinima}
                      onChange={(e) => setExperienciaMinima(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="localizacao">Local da Vaga *</Label>
                    <Input
                      id="localizacao"
                      placeholder="Ex: Guaíba/RS"
                      value={localizacao}
                      onChange={(e) => setLocalizacao(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Linha 5: Faixa Salarial e Tipo de Contrato */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salario">Faixa Salarial</Label>
                    <Input
                      id="salario"
                      placeholder="Ex: R$ 7.000,00"
                      value={salario}
                      onChange={(e) => setSalario(e.target.value)}
                    />
                  </div>
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
                </div>

                {/* Benefícios */}
                <div className="space-y-2">
                  <Label htmlFor="beneficios">Benefícios</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="beneficios"
                      placeholder="Ex: Plano de saúde, Transporte"
                      value={beneficioInput}
                      onChange={(e) => setBeneficioInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBeneficio())}
                    />
                    <Button type="button" onClick={addBeneficio}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {beneficios.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {beneficios.map((beneficio) => (
                        <div
                          key={beneficio}
                          className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm"
                        >
                          <span>{beneficio}</span>
                          <button
                            type="button"
                            onClick={() => removeBeneficio(beneficio)}
                            className="text-primary hover:text-primary/80"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Descrição e Requisitos */}
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

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Cadastrar Vaga</Button>
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
