"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Save, Trash2, Edit } from "lucide-react"
import type { Candidato, Autoavaliacao, Competencia, NivelCompetencia } from "@/lib/types"

// Áreas de competência disponíveis
const AREAS_COMPETENCIA = [
  "Automação",
  "Caldeiraria e Solda",
  "Elétrica",
  "Instrumentação",
  "Mecânica",
  "Outra",
]

// Competências padrão por área (exemplos)
const COMPETENCIAS_POR_AREA: Record<string, string[]> = {
  Automação: [
    "CLP (Controladores Lógicos Programáveis)",
    "SCADA (Supervisory Control and Data Acquisition)",
    "Sensores e Atuadores",
    "Redes Industriais",
    "Programação Ladder",
    "HMI (Interface Homem-Máquina)",
    "Sistemas de Controle",
  ],
  "Caldeiraria e Solda": [
    "Solda TIG",
    "Solda MIG/MAG",
    "Solda Eletrodo Revestido",
    "Leitura de Desenho Técnico",
    "Corte e Dobra de Chapas",
    "Montagem de Estruturas Metálicas",
    "Controle de Qualidade",
  ],
  Elétrica: [
    "Instalações Elétricas",
    "Leitura de Diagramas Elétricos",
    "Manutenção Elétrica",
    "NR-10",
    "Comandos Elétricos",
    "Automação Elétrica",
    "Medições Elétricas",
  ],
  Instrumentação: [
    "Instrumentos de Medição",
    "Calibração de Instrumentos",
    "Válvulas de Controle",
    "Transmissores",
    "Sistemas de Controle de Processo",
    "Manutenção de Instrumentos",
    "Leitura de P&ID",
  ],
  Mecânica: [
    "Manutenção Mecânica",
    "Usinagem",
    "Leitura de Desenho Mecânico",
    "Lubrificação",
    "Alinhamento de Máquinas",
    "Solda Mecânica",
    "Metrologia",
  ],
}

const NIVELS_COMPETENCIA: NivelCompetencia[] = [
  "Iniciante",
  "Básico",
  "Intermediário",
  "Avançado",
  "Especialista",
]

export default function AutoavaliacaoPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [candidato, setCandidato] = useState<Candidato | null>(null)
  const [autoavaliacoes, setAutoavaliacoes] = useState<Autoavaliacao[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [areaSelecionada, setAreaSelecionada] = useState("")
  const [areaCustomizada, setAreaCustomizada] = useState("")
  const [competencias, setCompetencias] = useState<Competencia[]>([])
  const [observacoes, setObservacoes] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role === "candidato") {
      const candidatoData = user as Candidato
      setCandidato(candidatoData)
      setAutoavaliacoes(candidatoData.autoavaliacoes || [])
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== "candidato") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const adicionarCompetencia = () => {
    const novaCompetencia: Competencia = {
      id: Date.now().toString(),
      nome: "",
      nivel: "Iniciante",
    }
    setCompetencias([...competencias, novaCompetencia])
  }

  const atualizarCompetencia = (id: string, campo: keyof Competencia, valor: any) => {
    setCompetencias(
      competencias.map((comp) => (comp.id === id ? { ...comp, [campo]: valor } : comp))
    )
  }

  const removerCompetencia = (id: string) => {
    setCompetencias(competencias.filter((comp) => comp.id !== id))
  }

  const carregarCompetenciasPadrao = (area: string) => {
    const competenciasPadrao = COMPETENCIAS_POR_AREA[area] || []
    setCompetencias(
      competenciasPadrao.map((nome, index) => ({
        id: `padrao-${index}`,
        nome,
        nivel: "Iniciante" as NivelCompetencia,
      }))
    )
  }

  const abrirDialogNova = () => {
    setEditingId(null)
    setAreaSelecionada("")
    setAreaCustomizada("")
    setCompetencias([])
    setObservacoes("")
    setDialogOpen(true)
  }

  const abrirDialogEditar = (autoavaliacao: Autoavaliacao) => {
    setEditingId(autoavaliacao.id)
    setAreaSelecionada(autoavaliacao.area)
    setAreaCustomizada("")
    setCompetencias(autoavaliacao.competencias)
    setObservacoes(autoavaliacao.observacoes || "")
    setDialogOpen(true)
  }

  const salvarAutoavaliacao = () => {
    if (!candidato) return

    const area = areaSelecionada === "Outra" ? areaCustomizada : areaSelecionada
    if (!area || competencias.length === 0) {
      alert("Preencha a área e adicione pelo menos uma competência")
      return
    }

    const autoavaliacao: Autoavaliacao = {
      id: editingId || Date.now().toString(),
      area,
      competencias: competencias.filter((c) => c.nome.trim() !== ""),
      dataRealizacao: editingId
        ? autoavaliacoes.find((a) => a.id === editingId)?.dataRealizacao || new Date()
        : new Date(),
      observacoes: observacoes || undefined,
    }

    let novasAutoavaliacoes: Autoavaliacao[]
    if (editingId) {
      novasAutoavaliacoes = autoavaliacoes.map((a) =>
        a.id === editingId ? autoavaliacao : a
      )
    } else {
      novasAutoavaliacoes = [...autoavaliacoes, autoavaliacao]
    }

    setAutoavaliacoes(novasAutoavaliacoes)

    const updatedCandidato: Candidato = {
      ...candidato,
      autoavaliacoes: novasAutoavaliacoes,
    }

    setCandidato(updatedCandidato)
    localStorage.setItem("currentUser", JSON.stringify(updatedCandidato))
    setDialogOpen(false)
  }

  const removerAutoavaliacao = (id: string) => {
    if (!candidato) return
    if (!confirm("Tem certeza que deseja remover esta autoavaliação?")) return

    const novasAutoavaliacoes = autoavaliacoes.filter((a) => a.id !== id)
    setAutoavaliacoes(novasAutoavaliacoes)

    const updatedCandidato: Candidato = {
      ...candidato,
      autoavaliacoes: novasAutoavaliacoes,
    }

    setCandidato(updatedCandidato)
    localStorage.setItem("currentUser", JSON.stringify(updatedCandidato))
  }

  const getNivelColor = (nivel: NivelCompetencia) => {
    const colors = {
      Iniciante: "bg-gray-100 text-gray-800",
      Básico: "bg-blue-100 text-blue-800",
      Intermediário: "bg-yellow-100 text-yellow-800",
      Avançado: "bg-orange-100 text-orange-800",
      Especialista: "bg-green-100 text-green-800",
    }
    return colors[nivel]
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <DashboardHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Autoavaliação de Competências</h2>
            <p className="text-muted-foreground">
              Avalie suas competências técnicas em diferentes áreas profissionais
            </p>
          </div>
          <Button onClick={abrirDialogNova}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Autoavaliação
          </Button>
        </div>

        {autoavaliacoes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Você ainda não realizou nenhuma autoavaliação
              </p>
              <Button onClick={abrirDialogNova}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Autoavaliação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {autoavaliacoes.map((autoavaliacao) => (
              <Card key={autoavaliacao.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{autoavaliacao.area}</CardTitle>
                      <CardDescription>
                        Realizada em {autoavaliacao.dataRealizacao.toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirDialogEditar(autoavaliacao)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removerAutoavaliacao(autoavaliacao.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {autoavaliacao.competencias.map((competencia) => (
                      <div
                        key={competencia.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{competencia.nome}</p>
                          {competencia.descricao && (
                            <p className="text-sm text-muted-foreground">{competencia.descricao}</p>
                          )}
                          {competencia.anosExperiencia && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {competencia.anosExperiencia} anos de experiência
                            </p>
                          )}
                        </div>
                        <Badge className={getNivelColor(competencia.nivel)}>
                          {competencia.nivel}
                        </Badge>
                      </div>
                    ))}
                    {autoavaliacao.observacoes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Observações:</p>
                        <p className="text-sm text-muted-foreground">{autoavaliacao.observacoes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de Autoavaliação */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Autoavaliação" : "Nova Autoavaliação"}
              </DialogTitle>
              <DialogDescription>
                Selecione a área e avalie suas competências técnicas
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="area">Área de Competência *</Label>
                <Select value={areaSelecionada} onValueChange={(value) => {
                  setAreaSelecionada(value)
                  if (value !== "Outra") {
                    carregarCompetenciasPadrao(value)
                  } else {
                    setCompetencias([])
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS_COMPETENCIA.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {areaSelecionada === "Outra" && (
                <div className="space-y-2">
                  <Label htmlFor="areaCustomizada">Nome da Área *</Label>
                  <Input
                    id="areaCustomizada"
                    value={areaCustomizada}
                    onChange={(e) => setAreaCustomizada(e.target.value)}
                    placeholder="Digite o nome da área"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Competências *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={adicionarCompetencia}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Competência
                  </Button>
                </div>

                <div className="space-y-3">
                  {competencias.map((competencia) => (
                    <div key={competencia.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <Label>Nome da Competência *</Label>
                            <Input
                              value={competencia.nome}
                              onChange={(e) =>
                                atualizarCompetencia(competencia.id, "nome", e.target.value)
                              }
                              placeholder="Ex: CLP, Solda TIG, etc."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Descrição (opcional)</Label>
                            <Textarea
                              value={competencia.descricao || ""}
                              onChange={(e) =>
                                atualizarCompetencia(competencia.id, "descricao", e.target.value)
                              }
                              placeholder="Descreva sua experiência com esta competência"
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nível de Proficiência *</Label>
                              <Select
                                value={competencia.nivel}
                                onValueChange={(value) =>
                                  atualizarCompetencia(competencia.id, "nivel", value as NivelCompetencia)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {NIVELS_COMPETENCIA.map((nivel) => (
                                    <SelectItem key={nivel} value={nivel}>
                                      {nivel}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Anos de Experiência</Label>
                              <Input
                                type="number"
                                min="0"
                                value={competencia.anosExperiencia || ""}
                                onChange={(e) =>
                                  atualizarCompetencia(
                                    competencia.id,
                                    "anosExperiencia",
                                    e.target.value ? parseInt(e.target.value) : undefined
                                  )
                                }
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerCompetencia(competencia.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {competencias.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Adicione competências para esta área
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Adicione observações sobre suas competências nesta área"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={salvarAutoavaliacao}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Autoavaliação
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

