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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Save } from "lucide-react"
import { UploadCurriculo } from "@/components/upload-curriculo"
import type { Candidato, Educacao, Experiencia, Curso } from "@/lib/types"

export default function PerfilPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [candidato, setCandidato] = useState<Candidato | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Estados para formulários
  const [formData, setFormData] = useState({
    telefone: "",
    localizacao: "",
    curriculo: "",
    curriculoArquivo: null as string | null,
    curriculoNome: null as string | null,
    linkedin: "",
    portfolio: "",
    habilidades: [] as string[],
  })
  const [habilidadeInput, setHabilidadeInput] = useState("")

  // Estados para diálogos
  const [educacaoDialogOpen, setEducacaoDialogOpen] = useState(false)
  const [experienciaDialogOpen, setExperienciaDialogOpen] = useState(false)
  const [cursoDialogOpen, setCursoDialogOpen] = useState(false)

  // Estados para formulários de adição
  const [novaEducacao, setNovaEducacao] = useState<Partial<Educacao>>({})
  const [novaExperiencia, setNovaExperiencia] = useState<Partial<Experiencia>>({})
  const [novoCurso, setNovoCurso] = useState<Partial<Curso>>({})

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role === "candidato") {
      const candidatoData = user as Candidato
      setCandidato(candidatoData)
      setFormData({
        telefone: candidatoData.telefone || "",
        localizacao: candidatoData.localizacao || "",
        curriculo: candidatoData.curriculo || "",
        curriculoArquivo: candidatoData.curriculoArquivo || null,
        curriculoNome: candidatoData.curriculoNome || null,
        linkedin: candidatoData.linkedin || "",
        portfolio: candidatoData.portfolio || "",
        habilidades: candidatoData.habilidades || [],
      })
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

  const handleSave = () => {
    if (!candidato) return

    const updatedCandidato: Candidato = {
      ...candidato,
      ...formData,
      curriculoArquivo: formData.curriculoArquivo || undefined,
      curriculoNome: formData.curriculoNome || undefined,
    }

    setCandidato(updatedCandidato)
    localStorage.setItem("currentUser", JSON.stringify(updatedCandidato))
    setIsEditing(false)
  }

  const addHabilidade = () => {
    if (habilidadeInput.trim() && !formData.habilidades.includes(habilidadeInput.trim())) {
      setFormData({
        ...formData,
        habilidades: [...formData.habilidades, habilidadeInput.trim()],
      })
      setHabilidadeInput("")
    }
  }

  const removeHabilidade = (habilidade: string) => {
    setFormData({
      ...formData,
      habilidades: formData.habilidades.filter((h) => h !== habilidade),
    })
  }

  const handleAddEducacao = () => {
    if (!candidato) return

    const educacao: Educacao = {
      id: Date.now().toString(),
      instituicao: novaEducacao.instituicao || "",
      curso: novaEducacao.curso || "",
      nivel: novaEducacao.nivel || "Superior",
      status: novaEducacao.status || "Completo",
      dataInicio: novaEducacao.dataInicio,
      dataFim: novaEducacao.dataFim,
    }

    const updatedCandidato: Candidato = {
      ...candidato,
      educacao: [...(candidato.educacao || []), educacao],
    }

    setCandidato(updatedCandidato)
    localStorage.setItem("currentUser", JSON.stringify(updatedCandidato))
    setNovaEducacao({})
    setEducacaoDialogOpen(false)
  }

  const handleAddExperiencia = () => {
    if (!candidato) return

    const experiencia: Experiencia = {
      id: Date.now().toString(),
      empresa: novaExperiencia.empresa || "",
      cargo: novaExperiencia.cargo || "",
      descricao: novaExperiencia.descricao,
      dataInicio: novaExperiencia.dataInicio || new Date(),
      dataFim: novaExperiencia.dataFim,
      atual: novaExperiencia.atual || false,
    }

    const updatedCandidato: Candidato = {
      ...candidato,
      experiencias: [...(candidato.experiencias || []), experiencia],
    }

    setCandidato(updatedCandidato)
    localStorage.setItem("currentUser", JSON.stringify(updatedCandidato))
    setNovaExperiencia({})
    setExperienciaDialogOpen(false)
  }

  const handleAddCurso = () => {
    if (!candidato) return

    const curso: Curso = {
      id: Date.now().toString(),
      nome: novoCurso.nome || "",
      instituicao: novoCurso.instituicao || "",
      cargaHoraria: novoCurso.cargaHoraria,
      dataConclusao: novoCurso.dataConclusao,
      certificado: novoCurso.certificado,
    }

    const updatedCandidato: Candidato = {
      ...candidato,
      cursos: [...(candidato.cursos || []), curso],
    }

    setCandidato(updatedCandidato)
    localStorage.setItem("currentUser", JSON.stringify(updatedCandidato))
    setNovoCurso({})
    setCursoDialogOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
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
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          )}
        </div>

        <Tabs defaultValue="dados" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="profissional">Profissional</TabsTrigger>
            <TabsTrigger value="educacao">Educação</TabsTrigger>
            <TabsTrigger value="experiencia">Experiência</TabsTrigger>
            <TabsTrigger value="cursos">Cursos</TabsTrigger>
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
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
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
                  <Label>Arquivo do Currículo</Label>
                  <UploadCurriculo
                    onFileUpload={(file) => {
                      // Converte arquivo para base64 (em produção, enviaria para servidor)
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        const base64String = reader.result as string
                        setFormData({ 
                          ...formData, 
                          curriculoArquivo: base64String,
                          curriculoNome: file.name
                        })
                      }
                      reader.readAsDataURL(file)
                    }}
                    currentFile={formData.curriculoArquivo || undefined}
                    currentFileName={formData.curriculoNome || undefined}
                    onRemove={() => setFormData({ ...formData, curriculoArquivo: null, curriculoNome: null })}
                    disabled={!isEditing}
                  />
                </div>
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
                    {formData.habilidades.map((habilidade) => (
                      <div
                        key={habilidade}
                        className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm"
                      >
                        <span>{habilidade}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeHabilidade(habilidade)}
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
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfólio</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Cursos e Certificações</CardTitle>
                  <CardDescription>Seus cursos e certificações</CardDescription>
                </div>
                {isEditing && (
                  <Button onClick={() => setCursoDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {candidato?.cursos && candidato.cursos.length > 0 ? (
                  <div className="space-y-4">
                    {candidato.cursos.map((curso) => (
                      <div key={curso.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{curso.nome}</h4>
                            <p className="text-sm text-muted-foreground">{curso.instituicao}</p>
                            {curso.cargaHoraria && (
                              <p className="text-sm text-muted-foreground">{curso.cargaHoraria} horas</p>
                            )}
                            {curso.dataConclusao && (
                              <p className="text-sm text-muted-foreground">
                                Concluído em {curso.dataConclusao.toLocaleDateString("pt-BR")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Nenhum curso cadastrado</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Adicionar Educação */}
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
                  value={novaEducacao.instituicao || ""}
                  onChange={(e) => setNovaEducacao({ ...novaEducacao, instituicao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="curso">Curso</Label>
                <Input
                  id="curso"
                  value={novaEducacao.curso || ""}
                  onChange={(e) => setNovaEducacao({ ...novaEducacao, curso: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nivel">Nível</Label>
                <Select
                  value={novaEducacao.nivel || "Superior"}
                  onValueChange={(v) =>
                    setNovaEducacao({
                      ...novaEducacao,
                      nivel: v as Educacao["nivel"],
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
                  value={novaEducacao.status || "Completo"}
                  onValueChange={(v) =>
                    setNovaEducacao({
                      ...novaEducacao,
                      status: v as Educacao["status"],
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
                  value={novaExperiencia.empresa || ""}
                  onChange={(e) => setNovaExperiencia({ ...novaExperiencia, empresa: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={novaExperiencia.cargo || ""}
                  onChange={(e) => setNovaExperiencia({ ...novaExperiencia, cargo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={novaExperiencia.descricao || ""}
                  onChange={(e) => setNovaExperiencia({ ...novaExperiencia, descricao: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="atual"
                  checked={novaExperiencia.atual || false}
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

        {/* Dialog Adicionar Curso */}
        <Dialog open={cursoDialogOpen} onOpenChange={setCursoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Curso</DialogTitle>
              <DialogDescription>Adicione um novo curso ou certificação</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeCurso">Nome do Curso</Label>
                <Input
                  id="nomeCurso"
                  value={novoCurso.nome || ""}
                  onChange={(e) => setNovoCurso({ ...novoCurso, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instituicaoCurso">Instituição</Label>
                <Input
                  id="instituicaoCurso"
                  value={novoCurso.instituicao || ""}
                  onChange={(e) => setNovoCurso({ ...novoCurso, instituicao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargaHoraria">Carga Horária</Label>
                <Input
                  id="cargaHoraria"
                  type="number"
                  value={novoCurso.cargaHoraria || ""}
                  onChange={(e) =>
                    setNovoCurso({ ...novoCurso, cargaHoraria: parseInt(e.target.value) || undefined })
                  }
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setCursoDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddCurso}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

