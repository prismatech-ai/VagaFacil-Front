"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { CandidatoSidebar } from "@/components/candidato-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Autoavaliacao = {
  habilidade: string
  nivel: number
  descricao?: string
}

export default function AutoavaliacaoPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()

  const [autoavaliacao, setAutoavaliacao] = useState<Autoavaliacao[]>([])
  const [isLoading_, setIsLoading_] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    habilidade: "",
    nivel: 3,
    descricao: "",
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role === "candidato") {
      loadAutoavaliacao()
    }
  }, [user, isLoading, router])

  const loadAutoavaliacao = async () => {
    try {
      setIsLoading_(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/autoavaliacao/minha`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Autoavaliação carregada:", data)
        
        // Tratar resposta - pode vir como array direto ou em um objeto
        const respostas = Array.isArray(data) ? data : (data.respostas || data.data || [])
        setAutoavaliacao(respostas)
      } else if (response.status === 404) {
        // Sem autoavaliação cadastrada ainda
        setAutoavaliacao([])
      } else {
        throw new Error("Erro ao carregar autoavaliação")
      }
    } catch (error) {
      console.error("Erro ao carregar autoavaliação:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar autoavaliação",
      })
    } finally {
      setIsLoading_(false)
    }
  }

  const handleAddHabilidade = () => {
    if (!formData.habilidade.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Digite o nome da habilidade",
      })
      return
    }

    if (editingIndex !== null) {
      // Editar
      const novaAutoavaliacao = [...autoavaliacao]
      novaAutoavaliacao[editingIndex] = {
        habilidade: formData.habilidade,
        nivel: formData.nivel,
        descricao: formData.descricao || undefined,
      }
      setAutoavaliacao(novaAutoavaliacao)
      setEditingIndex(null)
    } else {
      // Adicionar
      setAutoavaliacao([
        ...autoavaliacao,
        {
          habilidade: formData.habilidade,
          nivel: formData.nivel,
          descricao: formData.descricao || undefined,
        },
      ])
    }

    setFormData({
      habilidade: "",
      nivel: 3,
      descricao: "",
    })
    setDialogOpen(false)
  }

  const handleEditHabilidade = (index: number) => {
    const habilidade = autoavaliacao[index]
    setFormData({
      habilidade: habilidade.habilidade,
      nivel: habilidade.nivel,
      descricao: habilidade.descricao || "",
    })
    setEditingIndex(index)
    setDialogOpen(true)
  }

  const handleDeleteHabilidade = (index: number) => {
    const novaAutoavaliacao = autoavaliacao.filter((_, i) => i !== index)
    setAutoavaliacao(novaAutoavaliacao)
  }

  const handleSave = async () => {
    if (autoavaliacao.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Adicione pelo menos uma habilidade",
      })
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Token não encontrado")
        return
      }

      const dataToSend = {
        respostas: autoavaliacao,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/autoavaliacao/salvar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Erro na resposta:", response.status, errorData)
        throw new Error(`Erro ao salvar: ${response.status}`)
      }

      const result = await response.json()
      console.log("Autoavaliação salva:", result)

      toast({
        title: "Sucesso",
        description: "Autoavaliação salva com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao salvar autoavaliação:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Erro ao salvar: ${error instanceof Error ? error.message : "Desconhecido"}`,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAutoavaliacao = async () => {
    if (!confirm("Tem certeza que deseja deletar toda a autoavaliação?")) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Token não encontrado")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/autoavaliacao/deletar`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erro ao deletar autoavaliação")
      }

      setAutoavaliacao([])
      toast({
        title: "Sucesso",
        description: "Autoavaliação deletada com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao deletar autoavaliação:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao deletar autoavaliação",
      })
    }
  }

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

  return (
    <SidebarProvider>
      <CandidatoSidebar />
      <div className="min-h-screen flex flex-col bg-secondary/30 w-full">
        <DashboardHeader />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Autoavaliação de Habilidades</h2>
              <p className="text-muted-foreground">
                Avalie suas próprias habilidades para que empresas conheçam melhor seu perfil
              </p>
            </div>
            <div className="flex gap-2">
              {autoavaliacao.length > 0 && (
                <>
                  <Button onClick={handleSave} disabled={isSaving} variant="default">
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Salvando..." : "Salvar Avaliação"}
                  </Button>
                  <Button onClick={handleDeleteAutoavaliacao} variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deletar Tudo
                  </Button>
                </>
              )}
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Habilidade
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {isLoading_ ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Carregando autoavaliação...</p>
                  </div>
                </CardContent>
              </Card>
            ) : autoavaliacao.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">Nenhuma habilidade avaliada ainda</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Começar Autoavaliação
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {autoavaliacao.map((habilidade, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{habilidade.habilidade}</h3>
                          
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm text-muted-foreground">Nível de Proficiência</Label>
                              <span className="font-semibold">{habilidade.nivel}/5</span>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div
                                  key={star}
                                  className={`h-2 flex-1 rounded-full ${
                                    star <= habilidade.nivel ? "bg-primary" : "bg-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {habilidade.descricao && (
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground mb-1">Descrição:</p>
                              <p className="text-sm">{habilidade.descricao}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditHabilidade(index)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteHabilidade(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {autoavaliacao.length > 0 && (
                  <div className="flex gap-2 justify-center mt-6">
                    <Button onClick={handleSave} disabled={isSaving} size="lg">
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Salvando..." : "Salvar Autoavaliação"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Dialog Adicionar/Editar Habilidade */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingIndex !== null ? "Editar Habilidade" : "Adicionar Habilidade"}
                </DialogTitle>
                <DialogDescription>
                  Adicione ou edite uma habilidade e avalie seu nível de proficiência (1-5)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="habilidade">Habilidade</Label>
                  <Input
                    id="habilidade"
                    value={formData.habilidade}
                    onChange={(e) => setFormData({ ...formData, habilidade: e.target.value })}
                    placeholder="Ex: Python, React, SQL"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Nível de Proficiência</Label>
                    <span className="text-sm font-semibold">{formData.nivel}/5</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Button
                        key={level}
                        type="button"
                        variant={formData.nivel === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData({ ...formData, nivel: level })}
                        className="flex-1"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">1 = Iniciante | 5 = Avançado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição (opcional)</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Exemplo: Django e FastAPI, ou Experiência pessoal"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false)
                      setEditingIndex(null)
                      setFormData({
                        habilidade: "",
                        nivel: 3,
                        descricao: "",
                      })
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="button" onClick={handleAddHabilidade}>
                    {editingIndex !== null ? "Atualizar" : "Adicionar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  )
}

