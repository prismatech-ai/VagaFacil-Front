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
import { Plus, Edit, Save, Upload, X } from "lucide-react"
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
    cpf: "",
    rg: "",
    dataNascimento: "",
    genero: "",
    cidade: "",
    estado: "",
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    curriculo: "",
    linkedin: "",
    portfolio: "",
    bio: "",
    isPCD: false,
    tipoPCD: "",
    necessidadesAdaptacao: "",
    experienciaProfissional: "",
    formacaoEscolaridade: "",
  })
  const [habilidadeInput, setHabilidadeInput] = useState("")
  const [curriculoFile, setCurriculoFile] = useState<File | null>(null)
  const [uploadingCurriculo, setUploadingCurriculo] = useState(false)
  const [dragActive, setDragActive] = useState(false)

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
      const token = localStorage.getItem('token')
      if (!token) return

      // Buscar dados completos do onboarding que já retorna tudo
      const responseOnboarding = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!responseOnboarding.ok) {
        throw new Error('Falha ao carregar perfil do onboarding')
      }

      const onboardingData = await responseOnboarding.json()
      console.log('Dados do candidato (onboarding):', onboardingData)
      
      setCandidato({
        ...onboardingData,
        habilidades: onboardingData.habilidades || []
      })
      
      setFormData({
        telefone: onboardingData.phone || "",
        cpf: onboardingData.cpf || "",
        rg: onboardingData.rg || "",
        dataNascimento: onboardingData.birth_date || "",
        genero: onboardingData.genero || "",
        cidade: onboardingData.cidade || "",
        estado: onboardingData.estado || "",
        cep: onboardingData.cep || "",
        logradouro: onboardingData.logradouro || "",
        numero: onboardingData.numero || "",
        bairro: onboardingData.bairro || "",
        curriculo: onboardingData.curriculo_url || "",
        linkedin: onboardingData.linkedin_url || "",
        portfolio: onboardingData.portfolio_url || "",
        bio: onboardingData.bio || "",
        isPCD: onboardingData.is_pcd || false,
        tipoPCD: onboardingData.tipo_pcd || "",
        necessidadesAdaptacao: onboardingData.necessidades_adaptacao || "",
        experienciaProfissional: onboardingData.experiencia_profissional || "",
        formacaoEscolaridade: onboardingData.formacao_escolaridade || "",
      })
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar seu perfil. Tente novamente."
      })
    }
  }

  const loadOnboarding = async () => {
    if (!user) return

    setIsLoadingOnboarding(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Carregar status completo do onboarding que retorna todos os dados do perfil
      const responseStatus = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (responseStatus.ok) {
        const statusData = await responseStatus.json()
        console.log('Status completo do onboarding:', statusData)
        
        // Extrair progresso do status completo
        const progresso = {
          percentual_completude: statusData.percentual_completude,
          dados_pessoais_completo: !!statusData.full_name && !!statusData.email && !!statusData.phone,
          dados_profissionais_completo: !!statusData.experiencia_profissional && !!statusData.formacao_escolaridade && statusData.habilidades?.length > 0,
          teste_habilidades_completo: statusData.teste_habilidades_completado,
          onboarding_completo: statusData.onboarding_completo
        }
        
        setOnboardingProgresso(progresso)
        setOnboardingStatus(statusData)
        
        // Atualizar candidato com dados do status se necessário
        if (statusData.habilidades) {
          setCandidato(prev => prev ? {
            ...prev,
            habilidades: statusData.habilidades,
            teste_habilidades_completado: statusData.teste_habilidades_completado,
            score_teste_habilidades: statusData.score_teste_habilidades
          } : null)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar onboarding:", error)
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
      const token = localStorage.getItem('token')
      if (!token) {
        alert("Token não encontrado")
        return
      }

      // Mapear formData para o formato esperado pela API
      const dataToSend = {
        phone: formData.telefone,
        cpf: formData.cpf,
        rg: formData.rg,
        birth_date: formData.dataNascimento,
        genero: formData.genero,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        logradouro: formData.logradouro,
        numero: formData.numero,
        bairro: formData.bairro,
        bio: formData.bio,
        linkedin_url: formData.linkedin,
        portfolio_url: formData.portfolio,
        is_pcd: formData.isPCD,
        tipo_pcd: formData.tipoPCD,
        necessidades_adaptacao: formData.necessidadesAdaptacao,
        experiencia_profissional: formData.experienciaProfissional,
        formacao_escolaridade: formData.formacaoEscolaridade,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Erro na resposta:', response.status, errorData)
        throw new Error(`Erro ao salvar: ${response.status}`)
      }

      const updatedCandidato = await response.json()
      console.log('Candidato atualizado:', updatedCandidato)

      setCandidato(updatedCandidato)
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
        description: `Erro ao salvar perfil: ${error instanceof Error ? error.message : 'Desconhecido'}`
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

  // Handlers para upload de currículo
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setCurriculoFile(file)
        uploadCurriculo(file)
      } else {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: "Por favor, envie um arquivo PDF"
        })
      }
    }
  }

  const handleCurriculoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setCurriculoFile(file)
        uploadCurriculo(file)
      } else {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: "Por favor, envie um arquivo PDF"
        })
      }
    }
  }

  const uploadCurriculo = async (file: File) => {
    if (!file) return

    setUploadingCurriculo(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Token não encontrado"
        })
        return
      }

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/upload-curriculo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erro ao fazer upload do currículo")
      }

      const data = await response.json()
      
      // Atualizar o perfil com a URL do currículo
      setFormData(prev => ({
        ...prev,
        curriculo: data.curriculo_url || file.name
      }))
      
      if (candidato) {
        setCandidato({
          ...candidato,
          curriculo_url: data.curriculo_url || file.name
        })
      }

      toast({
        title: "Sucesso!",
        description: "Currículo enviado com sucesso"
      })
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar o currículo. Tente novamente."
      })
    } finally {
      setUploadingCurriculo(false)
    }
  }

  const removeCurriculo = () => {
    setCurriculoFile(null)
    setFormData(prev => ({
      ...prev,
      curriculo: ""
    }))
    if (candidato) {
      setCandidato({
        ...candidato,
        curriculo_url: undefined
      })
    }
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
            <TabsTrigger value="pcd">PCD</TabsTrigger>
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
                  <Input id="nome" value={candidato?.full_name || candidato?.nome || ""} disabled />
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
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      disabled={!isEditing}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      value={formData.rg}
                      onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genero">Gênero</Label>
                    <Input
                      id="genero"
                      value={formData.genero}
                      onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    disabled={!isEditing}
                    placeholder="00000-000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={formData.logradouro}
                    onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
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
                  <Label htmlFor="bio">Bio / Resumo Profissional</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={6}
                    placeholder="Conte um pouco sobre você, suas experiências e objetivos profissionais..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">URL LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/seu-perfil"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">URL Portfólio</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://seuportifolio.com"
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

                {/* Seção de Upload de Currículo */}
                <div className="space-y-2 mt-8 pt-8 border-t">
                  <Label htmlFor="curriculo">Currículo (PDF)</Label>
                  
                  {candidato?.curriculo_url || formData.curriculo ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900">
                            {curriculoFile?.name || formData.curriculo || "Currículo enviado"}
                          </p>
                          <p className="text-xs text-green-700">Arquivo carregado com sucesso</p>
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={removeCurriculo}
                          className="text-green-600 hover:text-red-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-gray-300 hover:border-primary/50"
                      } ${!isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="file"
                        id="curriculo"
                        accept=".pdf"
                        onChange={handleCurriculoChange}
                        disabled={!isEditing || uploadingCurriculo}
                        className="hidden"
                      />
                      
                      {uploadingCurriculo ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground">Enviando currículo...</p>
                        </div>
                      ) : (
                        <label
                          htmlFor="curriculo"
                          className={`flex flex-col items-center gap-2 ${isEditing ? "cursor-pointer" : ""}`}
                        >
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="font-semibold text-foreground">
                            Arraste seu currículo aqui
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ou clique para selecionar um arquivo PDF
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Máximo 10MB • Apenas PDF
                          </p>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab PCD */}
          <TabsContent value="pcd" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Acessibilidade</CardTitle>
                <CardDescription>Dados sobre deficiência e necessidades de adaptação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPCD"
                    checked={formData.isPCD}
                    onChange={(e) => setFormData({ ...formData, isPCD: e.target.checked })}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="isPCD" className="cursor-pointer">
                    Sou uma Pessoa com Deficiência (PCD)
                  </Label>
                </div>

                {formData.isPCD && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="tipoPCD">Tipo de Deficiência</Label>
                      <Input
                        id="tipoPCD"
                        value={formData.tipoPCD}
                        onChange={(e) => setFormData({ ...formData, tipoPCD: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Ex: Mobilidade Reduzida, Visual, Auditiva, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="necessidadesAdaptacao">Necessidades de Adaptação</Label>
                      <Textarea
                        id="necessidadesAdaptacao"
                        value={formData.necessidadesAdaptacao}
                        onChange={(e) => setFormData({ ...formData, necessidadesAdaptacao: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                        placeholder="Descreva as adaptações que você necessita no ambiente de trabalho..."
                      />
                    </div>
                  </>
                )}
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
