"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { EmpresaSidebar } from "@/components/empresa-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Briefcase, Eye, Trash2, MapPin, DollarSign, CheckCircle2, X, Send, ArrowLeft } from "lucide-react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Job {
  id: number
  title: string
  description: string
  requirements: string
  benefits: string
  location: string
  remote: boolean
  job_type: string
  salary_min: string
  salary_max: string
  salary_currency: string
  status: string
  company_id: number
  views_count: number
  applications_count: number
  created_at: string
  updated_at: string
  published_at?: string
  closed_at?: string
  screening_questions: Array<{
    id?: number
    question: string
    question_type: string
    is_required: boolean
    order: number
  }>
}

interface ScreeningQuestion {
  question: string
  question_type: "text" | "multiple_choice" | "essay"
  is_required: boolean
  order: number
  options?: string[] // para multiple_choice
}

export default function JobsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [jobCriada, setJobCriada] = useState<Job | null>(null)
  const [error, setError] = useState("")
  const [publishing, setPublishing] = useState<number | null>(null)

  // Form state
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [requisitos, setRequisitos] = useState("")
  const [beneficios, setBeneficios] = useState<string[]>([])
  const [beneficioInput, setBeneficioInput] = useState("")
  const [localizacao, setLocalizacao] = useState("")
  const [remote, setRemote] = useState(false)
  const [jobType, setJobType] = useState("CLT")
  const [salaryMin, setSalaryMin] = useState("")
  const [salaryMax, setSalaryMax] = useState("")
  const [salaryCurrency, setSalaryCurrency] = useState("BRL")
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [currentQuestionType, setCurrentQuestionType] = useState<"text" | "multiple_choice" | "essay">("text")
  const [currentQuestionRequired, setCurrentQuestionRequired] = useState(true)

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
      loadJobs()
    }
  }, [user, isLoading, router])

  const loadJobs = async () => {
    if (!user) return

    try {
      setLoadingData(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      })

      if (response.ok) {
        const allJobs = await response.json()
        console.log("GET /api/v1/jobs/ - Todos os jobs recebidos:", allJobs)
        console.log("User ID:", user.id, "Tipo:", typeof user.id)
        console.log("User completo:", user)
        
        // Filtra apenas os jobs da empresa
        if (Array.isArray(allJobs)) {
          console.log("Company IDs dos jobs:", allJobs.map((j: Job) => ({ id: j.company_id, type: typeof j.company_id })))
          
          // Converte IDs para número para comparação
          const userIdNum = Number(user.id)
          
          const empresaJobs = allJobs.filter((j: Job) => {
            const companyIdNum = Number(j.company_id)
            const match = companyIdNum === userIdNum
            console.log(`Comparando company_id ${j.company_id} (${companyIdNum}) com user.id ${user.id} (${userIdNum}): ${match}`)
            return match
          })
          
          console.log("Jobs filtrados para esta empresa:", empresaJobs)
          
          // Se não houver jobs filtrados, mostra todos para debug
          if (empresaJobs.length === 0 && allJobs.length > 0) {
            console.warn("ATENÇÃO: Nenhum job filtrado! Mostrando todos os jobs para debug")
            setJobs(allJobs)
          } else {
            setJobs(empresaJobs)
          }
        } else {
          console.warn("allJobs não é um array:", typeof allJobs)
          setJobs([])
        }
      } else {
        console.warn("Erro ao carregar jobs:", response.status)
        setJobs([])
      }
    } catch (error) {
      console.error("Erro ao carregar jobs:", error)
      setJobs([])
    } finally {
      setLoadingData(false)
    }
  }

  const addBeneficio = () => {
    if (beneficioInput.trim() && !beneficios.includes(beneficioInput.trim())) {
      setBeneficios([...beneficios, beneficioInput.trim()])
      setBeneficioInput("")
    }
  }

  const removeBeneficio = (beneficio: string) => {
    setBeneficios(beneficios.filter((b) => b !== beneficio))
  }

  const addScreeningQuestion = () => {
    if (currentQuestion.trim()) {
      const newQuestion: ScreeningQuestion = {
        question: currentQuestion,
        question_type: currentQuestionType,
        is_required: currentQuestionRequired,
        order: screeningQuestions.length,
      }
      setScreeningQuestions([...screeningQuestions, newQuestion])
      setCurrentQuestion("")
      setCurrentQuestionType("text")
      setCurrentQuestionRequired(true)
    }
  }

  const removeScreeningQuestion = (index: number) => {
    setScreeningQuestions(screeningQuestions.filter((_, i) => i !== index))
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user) return

    try {
      if (!titulo || !descricao || !requisitos || !localizacao) {
        setError("Preencha todos os campos obrigatórios (*, título, descrição, requisitos, localização)")
        return
      }

      // Validação de comprimento mínimo
      if (titulo.length < 3) {
        setError("O título deve ter pelo menos 3 caracteres")
        return
      }

      if (descricao.length < 10) {
        setError("A descrição deve ter pelo menos 10 caracteres")
        return
      }

      if (requisitos.length < 10) {
        setError("Os requisitos devem ter pelo menos 10 caracteres")
        return
      }

      if (localizacao.length < 3) {
        setError("A localização deve ter pelo menos 3 caracteres")
        return
      }

      const jobData = {
        title: titulo,
        description: descricao,
        requirements: requisitos,
        benefits: beneficios.length > 0 ? beneficios.join(", ") : "",
        location: localizacao,
        remote: remote,
        job_type: jobType,
        salary_min: salaryMin ? parseInt(salaryMin) : 0,
        salary_max: salaryMax ? parseInt(salaryMax) : 0,
        salary_currency: salaryCurrency,
        screening_questions: screeningQuestions.map((q, idx) => ({
          question: q.question,
          question_type: q.question_type,
          is_required: q.is_required,
          order: idx,
        })),
      }

      console.log("POST /api/v1/jobs/ - Criando vaga (RASCUNHO):", jobData)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Erro ao criar vaga - Status:", response.status)
        console.error("Erro ao criar vaga - Response completa:", JSON.stringify(errorData, null, 2))
        console.error("Erro ao criar vaga - jobData enviado:", jobData)
        
        // Tenta extrair mensagem de erro detalhada
        let errorMessage = `Erro ${response.status} ao criar vaga`
        if (errorData.detail) {
          console.error("Erro ao criar vaga - Detail:", errorData.detail)
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((err: any) => {
              if (typeof err === 'string') return err
              if (err.msg) return err.msg
              return JSON.stringify(err)
            }).join('; ')
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          }
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
          // Se for um objeto com campos, mostra os erros dos campos
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]: [string, any]) => {
              if (Array.isArray(errors)) {
                return `${field}: ${errors.join(', ')}`
              }
              return `${field}: ${errors}`
            })
            .join('; ')
          errorMessage = fieldErrors || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      const novaJob = await response.json()
      console.log("Vaga criada com sucesso:", novaJob)

      setJobCriada(novaJob)
      setShowSuccessDialog(true)
      setJobs([...jobs, novaJob])

      // Reset form
      setTitulo("")
      setDescricao("")
      setRequisitos("")
      setLocalizacao("")
      setSalaryMin("")
      setSalaryMax("")
      setJobType("CLT")
      setRemote(false)
      setBeneficios([])
      setBeneficioInput("")
      setScreeningQuestions([])
      setIsCreateDialogOpen(false)
    } catch (err: any) {
      console.error("Erro ao criar vaga:", err)
      console.error("Detalhes do erro:", err.message)
      setError(err?.message || "Erro ao criar vaga. Tente novamente.")
    }
  }

  const handlePublishJob = async (jobId: number) => {
    if (!user) return

    try {
      setPublishing(jobId)
      console.log(`POST /api/v1/jobs/${jobId}/publish - Publicando vaga`)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/${jobId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Erro ao publicar vaga:", response.status, errorData)
        throw new Error(errorData.message || `Erro ${response.status} ao publicar vaga`)
      }

      const updatedJob = await response.json()
      console.log("Vaga publicada com sucesso:", updatedJob)

      // Atualiza a lista de jobs
      setJobs(jobs.map((j) => (j.id === jobId ? updatedJob : j)))
    } catch (err: any) {
      console.error("Erro ao publicar vaga:", err)
      setError(err?.message || "Erro ao publicar vaga. Tente novamente.")
    } finally {
      setPublishing(null)
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

  const draftJobs = jobs.filter((j) => j.status === "rascunho")
  const publishedJobs = jobs.filter((j) => j.status === "aberta" || j.status === "published")
  const closedJobs = jobs.filter((j) => j.status === "fechada" || j.status === "closed")

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-secondary/30">
        <EmpresaSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-x-hidden">
          <DashboardHeader />

          <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="sm" asChild className="self-start">
              <Link href="/dashboard/empresa">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Gerenciar Vagas</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Crie, gerencie e publique suas vagas de emprego</p>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nova Vaga
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Criar Nova Vaga</DialogTitle>
                <DialogDescription className="text-sm">
                  A vaga será criada em modo RASCUNHO e poderá ser publicada depois
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateJob} className="space-y-4 sm:space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Seção 1: Informações Básicas */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="text-lg font-semibold">Informações Básicas</h3>

                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título da Vaga *</Label>
                    <Input
                      id="titulo"
                      placeholder="Ex: Desenvolvedor Full Stack"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                    />
                    <div className="flex justify-between items-center">
                      <p className={`text-xs ${titulo.length < 3 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {titulo.length}/3 caracteres mínimos
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Textarea
                      id="descricao"
                      placeholder="Descreva o dia a dia, responsabilidades..."
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      rows={4}
                      required
                    />
                    <div className="flex justify-between items-center">
                      <p className={`text-xs ${descricao.length < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {descricao.length}/10 caracteres mínimos
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requisitos">Requisitos *</Label>
                    <Textarea
                      id="requisitos"
                      placeholder="Lista de requisitos necessários..."
                      value={requisitos}
                      onChange={(e) => setRequisitos(e.target.value)}
                      rows={3}
                      required
                    />
                    <div className="flex justify-between items-center">
                      <p className={`text-xs ${requisitos.length < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {requisitos.length}/10 caracteres mínimos
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seção 2: Detalhes da Vaga */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="text-lg font-semibold">Detalhes da Vaga</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="localizacao">Localização *</Label>
                      <Input
                        id="localizacao"
                        placeholder="Ex: São Paulo, SP"
                        value={localizacao}
                        onChange={(e) => setLocalizacao(e.target.value)}
                        required
                      />
                      <div className="flex justify-between items-center">
                        <p className={`text-xs ${localizacao.length < 3 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {localizacao.length}/3 caracteres mínimos
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Tipo de Contrato *</Label>
                      <Select value={jobType} onValueChange={setJobType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CLT">CLT</SelectItem>
                          <SelectItem value="PJ">PJ</SelectItem>
                          <SelectItem value="Estágio">Estágio</SelectItem>
                          <SelectItem value="Temporário">Temporário</SelectItem>
                          <SelectItem value="Aprendiz">Aprendiz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border rounded-md p-3">
                    <input
                      id="remote"
                      type="checkbox"
                      checked={remote}
                      onChange={(e) => setRemote(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <Label htmlFor="remote" className="cursor-pointer">
                      Trabalho Remoto - {remote ? "Sim" : "Não"}
                    </Label>
                  </div>
                </div>

                {/* Seção 3: Salário */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="text-lg font-semibold">Faixa Salarial</h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaryMin">Salário Mínimo</Label>
                      <Input
                        id="salaryMin"
                        type="text"
                        placeholder="Ex: 3000"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salaryMax">Salário Máximo</Label>
                      <Input
                        id="salaryMax"
                        type="text"
                        placeholder="Ex: 8000"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salaryCurrency">Moeda</Label>
                      <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">BRL (Real)</SelectItem>
                          <SelectItem value="USD">USD (Dólar)</SelectItem>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Seção 4: Benefícios */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="text-lg font-semibold">Benefícios</h3>

                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Ex: Plano de saúde"
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

                {/* Seção 5: Perguntas de Triagem */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="text-lg font-semibold">Perguntas de Triagem (Opcional)</h3>
                  <p className="text-sm text-muted-foreground">Adicione perguntas que os candidatos devem responder</p>

                  <div className="space-y-3 border rounded-md p-4 bg-secondary/20">
                    <div className="space-y-2">
                      <Label htmlFor="question">Pergunta</Label>
                      <Textarea
                        id="question"
                        placeholder="Ex: Qual é sua experiência com React?"
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="questionType">Tipo de Resposta</Label>
                        <Select value={currentQuestionType} onValueChange={(v) => setCurrentQuestionType(v as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Texto Curto</SelectItem>
                            <SelectItem value="essay">Texto Longo</SelectItem>
                            <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end">
                        <div className="flex items-center gap-2 border rounded-md p-3 w-full">
                          <input
                            id="required"
                            type="checkbox"
                            checked={currentQuestionRequired}
                            onChange={(e) => setCurrentQuestionRequired(e.target.checked)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <Label htmlFor="required" className="cursor-pointer">
                            Obrigatória
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Button type="button" onClick={addScreeningQuestion} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Pergunta
                    </Button>
                  </div>

                  {screeningQuestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Perguntas Adicionadas ({screeningQuestions.length})</p>
                      {screeningQuestions.map((q, idx) => (
                        <div key={idx} className="flex items-start justify-between p-3 bg-secondary/20 rounded-md border">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{q.question}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Tipo: {q.question_type} {q.is_required ? "• Obrigatória" : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeScreeningQuestion(idx)}
                            className="text-destructive hover:text-destructive/80 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar em Rascunho
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Success Dialog */}
        {showSuccessDialog && jobCriada && (
          <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Vaga Criada com Sucesso!</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Card className="border-2 border-primary bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary">Parabéns!</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sua vaga foi criada em modo RASCUNHO. Você pode editá-la antes de publicar.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">ID da Vaga</p>
                        <p className="text-lg font-bold">{jobCriada.id}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge variant="secondary">{jobCriada.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Título</p>
                        <p className="text-lg font-semibold">{jobCriada.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button onClick={() => setShowSuccessDialog(false)} variant="outline">
                    Continuar Editando
                  </Button>
                  <Button onClick={() => setShowSuccessDialog(false)}>
                    <Send className="h-4 w-4 mr-2" />
                    Publicar Agora
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Tabs */}
        <Tabs defaultValue="draft" className="space-y-4">
          <TabsList>
            <TabsTrigger value="draft">
              Rascunhos ({draftJobs.length})
            </TabsTrigger>
            <TabsTrigger value="published">
              Publicadas ({publishedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Fechadas ({closedJobs.length})
            </TabsTrigger>
          </TabsList>

          {/* Rascunhos */}
          <TabsContent value="draft" className="space-y-4">
            {draftJobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma vaga em rascunho</h3>
                  <p className="text-muted-foreground text-center mb-4">Comece criando sua primeira vaga</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Vaga
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {draftJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <CardTitle className="text-base sm:text-lg truncate">{job.title}</CardTitle>
                            <Badge variant="secondary" className="text-xs">Rascunho</Badge>
                          </div>
                          <CardDescription className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{job.location}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              {job.remote ? "Remoto" : "Presencial"}
                            </span>
                            {(job.salary_min || job.salary_max) && (
                              <span className="flex items-center gap-1 whitespace-nowrap">
                                <DollarSign className="h-3 w-3" />
                                {job.salary_min} - {job.salary_max} {job.salary_currency}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 self-start flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handlePublishJob(job.id)}
                            disabled={publishing === job.id}
                            className="text-xs sm:text-sm"
                          >
                            {publishing === job.id ? "Publicando..." : "Publicar"}
                          </Button>
                          <Button variant="ghost" size="sm" className="hidden sm:flex">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs sm:text-sm mb-3 line-clamp-3">{job.description}</p>
                      {job.screening_questions && job.screening_questions.length > 0 && (
                        <div className="text-xs sm:text-sm">
                          <p className="font-medium mb-2 text-muted-foreground">
                            {job.screening_questions.length} perguntas de triagem
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Publicadas */}
          <TabsContent value="published" className="space-y-4">
            {publishedJobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma vaga publicada</h3>
                  <p className="text-muted-foreground text-center">
                    Publique uma vaga em rascunho para ela aparecer aqui
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {publishedJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow border-green-200">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <CardTitle className="text-base sm:text-lg truncate">{job.title}</CardTitle>
                            <Badge className="text-xs">Publicada</Badge>
                          </div>
                          <CardDescription className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                            {(job.salary_min || job.salary_max) && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {job.salary_min} - {job.salary_max} {job.salary_currency}
                              </span>
                            )}
                            <span className="text-muted-foreground">
                              👁️ {job.views_count} visualizações
                            </span>
                            <span className="text-muted-foreground">
                              📋 {job.applications_count} candidaturas
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Fechadas */}
          <TabsContent value="closed" className="space-y-4">
            {closedJobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma vaga fechada</h3>
                  <p className="text-muted-foreground text-center">
                    As vagas que você fechar aparecerão aqui
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {closedJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="line-through">{job.title}</CardTitle>
                            <Badge variant="secondary">Fechada</Badge>
                          </div>
                          <CardDescription className="flex flex-wrap gap-3 text-sm">
                            <span className="text-muted-foreground">
                              👁️ {job.views_count} visualizações
                            </span>
                            <span className="text-muted-foreground">
                              📋 {job.applications_count} candidaturas
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
