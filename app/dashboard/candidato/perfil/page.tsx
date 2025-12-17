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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Save } from "lucide-react"
import { UploadCurriculo } from "@/components/upload-curriculo"
import type { Candidato } from "@/lib/types"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function PerfilPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [candidato, setCandidato] = useState<Candidato | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [onboardingProgresso, setOnboardingProgresso] = useState<any>(null)
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null)
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(false)

  // Estados para formulários
  const [formData, setFormData] = useState({
    telefone: "",
    cidade: "",
    estado: "",
    curriculo: "",
    linkedin: "",
  })
  const [habilidadeInput, setHabilidadeInput] = useState("")

  // Estados para diálogos
  const [educacaoDialogOpen, setEducacaoDialogOpen] = useState(false)
  const [experienciaDialogOpen, setExperienciaDialogOpen] = useState(false)

  // Estados para formulários de adição
  const [novaEducacao, setNovaEducacao] = useState<{ instituicao: string; curso: string; nivel: string; status: string }>({
    instituicao: "",
    curso: "",
    nivel: "Superior",
    status: "Completo",
  })
  const [novaExperiencia, setNovaExperiencia] = useState<{ empresa: string; cargo: string; descricao: string; atual: boolean }>({
    empresa: "",
    cargo: "",
    descricao: "",
    atual: false,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role === "candidato") {
      loadPerfil()
      loadOnboarding()
    }
  }, [user, isLoading, router])

  const loadPerfil = async () => {
    if (!user) return

    try {
      const candidatoData = await api.get<Candidato>(`/api/v1/candidates/me`)
      setCandidato(candidatoData)
      setFormData({
        telefone: candidatoData.telefone || "",
        cidade: candidatoData.cidade || "",
        estado: candidatoData.estado || "",
        curriculo: candidatoData.curriculo || "",
        linkedin: candidatoData.linkedin || "",
      })
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar seu perfil. Tente novamente."
      })
      // Fallback para dados do user atual
      const candidatoData = user as Candidato
      setCandidato(candidatoData)
      setFormData({
        telefone: candidatoData.telefone || "",
        cidade: candidatoData.cidade || "",
        estado: candidatoData.estado || "",
        curriculo: candidatoData.curriculo || "",
        linkedin: candidatoData.linkedin || "",
      })
    }
  }

  const loadOnboarding = async () => {
    if (!user) return

    setIsLoadingOnboarding(true)
    try {
      // Carregar status do onboarding
      const status = await api.get(`/api/v1/candidates/onboarding/status`)
      setOnboardingStatus(status)

      // Carregar progresso do onboarding
      const progresso = await api.get(`/api/v1/candidates/onboarding/progresso`)
      setOnboardingProgresso(progresso)
    } catch (error) {
      console.error("Erro ao carregar onboarding:", error)
      // Não mostrar toast de erro, pois é opcional
    } finally {
      setIsLoadingOnboarding(false)
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

  const handleSave = async () => {
    if (!candidato || !user) return

    setIsSaving(true)
    try {
      const updatedCandidato = await api.put<Candidato>(`/api/v1/candidates/me`, formData)

      setCandidato(updatedCandidato)
      localStorage.setItem("currentUser", JSON.stringify(updatedCandidato))
      setIsEditing(false)
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      })
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar perfil. Tente novamente."
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addHabilidade = () => {
    if (!habilidadeInput.trim() || !candidato) return
    
    // Verificar se já existe
    if (candidato.habilidades?.some(h => h.habilidade === habilidadeInput.trim())) {
      toast({
        variant: "destructive",
        title: "Duplicada",
        description: "Esta habilidade já foi adicionada"
      })
      return
    }

    const updatedCandidato: Candidato = {
      ...candidato,
      habilidades: [
        ...(candidato.habilidades || []),
        {
          habilidade: habilidadeInput.trim(),
          nivel: 3,
          anos_experiencia: 0,
        }
      ]
    }
    
    setCandidato(updatedCandidato)
    setHabilidadeInput("")
  }

  const removeHabilidade = (habilidade: string) => {
    if (!candidato) return
    const updatedCandidato: Candidato = {
      ...candidato,
      habilidades: candidato.habilidades?.filter((h) => h.habilidade !== habilidade) || [],
    }
    setCandidato(updatedCandidato)
  }

  const handleAddEducacao = () => {
    if (!candidato || !novaEducacao.instituicao || !novaEducacao.curso) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha instituição e curso"
      })
      return
    }

    const educacao = {
      id: Date.now().toString(),
      instituicao: novaEducacao.instituicao,
      curso: novaEducacao.curso,
      nivel: novaEducacao.nivel,
      status: novaEducacao.status,
    }

    const updatedCandidato: Candidato = {
      ...candidato,
      educacao: [...(candidato.educacao || []), educacao],
    }

    setCandidato(updatedCandidato)
    setNovaEducacao({
      instituicao: "",
      curso: "",
      nivel: "Superior",
      status: "Completo",
    })
    setEducacaoDialogOpen(false)
  }

  const handleAddExperiencia = () => {
    if (!candidato || !novaExperiencia.empresa || !novaExperiencia.cargo) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha empresa e cargo"
      })
      return
    }

    const experiencia = {
      id: Date.now().toString(),
      empresa: novaExperiencia.empresa,
      cargo: novaExperiencia.cargo,
      descricao: novaExperiencia.descricao || "",
      dataInicio: new Date(),
      dataFim: undefined,
      atual: novaExperiencia.atual,
    }

    const updatedCandidato: Candidato = {
      ...candidato,
      experiencias: [...(candidato.experiencias || []), experiencia],
    }

    setCandidato(updatedCandidato)
    setNovaExperiencia({
      empresa: "",
      cargo: "",
      descricao: "",
      atual: false,
    })
    setExperienciaDialogOpen(false)
  }

  const handleDeleteEducacao = (id: string) => {
    if (!candidato) return
    const updatedCandidato: Candidato = {
      ...candidato,
      educacao: candidato.educacao?.filter((e) => e.id !== id) || [],
    }
    setCandidato(updatedCandidato)
  }

  const handleDeleteExperiencia = (id: string) => {
    if (!candidato) return
    const updatedCandidato: Candidato = {
      ...candidato,
      experiencias: candidato.experiencias?.filter((e) => e.id !== id) || [],
    }
    setCandidato(updatedCandidato)
  }

  return (
    <SidebarProvider>
      <CandidatoSidebar />
      <div className="min-h-screen flex flex-col bg-secondary/30 w-full">
        <DashboardHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Meu Perfil</h2>
            <p className="text-muted-foreground">Gerencie suas informações profissionais</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          )}
        </div>

        {/* Progresso do Onboarding */}
        {onboardingProgresso && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Progresso do Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Completude</span>
                    <span className="text-sm font-bold text-blue-600">{onboardingProgresso.percentual_completude}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${onboardingProgresso.percentual_completude}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${onboardingProgresso.dados_pessoais_completo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">Dados Pessoais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${onboardingProgresso.dados_profissionais_completo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">Dados Profissionais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${onboardingProgresso.teste_habilidades_completo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">Teste Habilidades</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${onboardingProgresso.onboarding_completo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">Onboarding Completo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="dados" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="profissional">Profissional</TabsTrigger>
            <TabsTrigger value="educacao">Educação</TabsTrigger>
            <TabsTrigger value="experiencia">Experiência</TabsTrigger>
          </TabsList>

          {/* Tab Dados Pessoais */}
          <TabsContent value="dados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Seus dados básicos de contato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" value={candidato?.nome || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={candidato?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="localizacao">Cidade</Label>
                  <Input
                    id="localizacao"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Profissional */}
          <TabsContent value="profissional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Profissionais</CardTitle>
                <CardDescription>Seu currículo, habilidades e links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="curriculo">Resumo Profissional</Label>
                  <Textarea
                    id="curriculo"
                    value={formData.curriculo}
                    onChange={(e) => setFormData({ ...formData, curriculo: e.target.value })}
                    disabled={!isEditing}
                    rows={6}
                    placeholder="Conte um pouco sobre você, suas experiências e objetivos profissionais..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="habilidades">Habilidades</Label>
                  {isEditing && (
                    <div className="flex gap-2 mb-2">
                      <Input
                        id="habilidade"
                        value={habilidadeInput}
                        onChange={(e) => setHabilidadeInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addHabilidade()}
                        placeholder="Adicionar habilidade"
                      />
                      <Button type="button" onClick={addHabilidade}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {candidato?.habilidades?.map((h) => (
                      <div
                        key={h.habilidade}
                        className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm"
                      >
                        <span>{h.habilidade} (Nível {h.nivel})</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeHabilidade(h.habilidade)}
                            className="text-primary hover:text-primary/80"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Educação */}
          <TabsContent value="educacao" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Formação Acadêmica</CardTitle>
                  <CardDescription>Suas formações e cursos acadêmicos</CardDescription>
                </div>
                {isEditing && (
                  <Button onClick={() => setEducacaoDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {candidato?.educacao && candidato.educacao.length > 0 ? (
                  <div className="space-y-4">
                    {candidato.educacao.map((edu) => (
                      <div key={edu.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{edu.curso}</h4>
                            <p className="text-sm text-muted-foreground">{edu.instituicao}</p>
                            <p className="text-sm text-muted-foreground">
                              {edu.nivel} • {edu.status}
                            </p>
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => handleDeleteEducacao(edu.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Nenhuma formação cadastrada</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Experiência */}
          <TabsContent value="experiencia" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Experiência Profissional</CardTitle>
                  <CardDescription>Suas experiências de trabalho</CardDescription>
                </div>
                {isEditing && (
                  <Button onClick={() => setExperienciaDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {candidato?.experiencias && candidato.experiencias.length > 0 ? (
                  <div className="space-y-4">
                    {candidato.experiencias.map((exp) => (
                      <div key={exp.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{exp.cargo}</h4>
                            <p className="text-sm text-muted-foreground">{exp.empresa}</p>
                            <p className="text-sm text-muted-foreground">
                              {exp.dataInicio.toLocaleDateString("pt-BR")} -{" "}
                              {exp.atual ? "Atual" : exp.dataFim?.toLocaleDateString("pt-BR")}
                            </p>
                            {exp.descricao && <p className="text-sm mt-2">{exp.descricao}</p>}
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => handleDeleteExperiencia(exp.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Nenhuma experiência cadastrada</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Cursos */}
          <TabsContent value="cursos" className="space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Cursos e Certificações</CardTitle>
                  <CardDescription>Seus cursos e certificações</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">Nenhum curso cadastrado</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <Dialog open={educacaoDialogOpen} onOpenChange={setEducacaoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Formação</DialogTitle>
              <DialogDescription>Adicione uma nova formação acadêmica</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instituicao">Instituição</Label>
                <Input
                  id="instituicao"
                  value={novaEducacao.instituicao}
                  onChange={(e) => setNovaEducacao({ ...novaEducacao, instituicao: e.target.value })}
                  placeholder="Nome da instituição"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="curso">Curso</Label>
                <Input
                  id="curso"
                  value={novaEducacao.curso}
                  onChange={(e) => setNovaEducacao({ ...novaEducacao, curso: e.target.value })}
                  placeholder="Nome do curso"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nivel">Nível</Label>
                <Select
                  value={novaEducacao.nivel}
                  onValueChange={(v) =>
                    setNovaEducacao({
                      ...novaEducacao,
                      nivel: v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                    <SelectItem value="Superior">Superior</SelectItem>
                    <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
                    <SelectItem value="Mestrado">Mestrado</SelectItem>
                    <SelectItem value="Doutorado">Doutorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={novaEducacao.status}
                  onValueChange={(v) =>
                    setNovaEducacao({
                      ...novaEducacao,
                      status: v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completo">Completo</SelectItem>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Incompleto">Incompleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEducacaoDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddEducacao}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Adicionar Experiência */}
        <Dialog open={experienciaDialogOpen} onOpenChange={setExperienciaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Experiência</DialogTitle>
              <DialogDescription>Adicione uma nova experiência profissional</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={novaExperiencia.empresa}
                  onChange={(e) => setNovaExperiencia({ ...novaExperiencia, empresa: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={novaExperiencia.cargo}
                  onChange={(e) => setNovaExperiencia({ ...novaExperiencia, cargo: e.target.value })}
                  placeholder="Seu cargo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={novaExperiencia.descricao}
                  onChange={(e) => setNovaExperiencia({ ...novaExperiencia, descricao: e.target.value })}
                  rows={4}
                  placeholder="Descreva suas responsabilidades"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="atual"
                  checked={novaExperiencia.atual}
                  onChange={(e) => setNovaExperiencia({ ...novaExperiencia, atual: e.target.checked })}
                />
                <Label htmlFor="atual">Trabalho atual</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setExperienciaDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddExperiencia}>
                  Adicionar
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
