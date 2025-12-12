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
import { Plus, Briefcase, Users, Eye, Edit, Trash2, MapPin, DollarSign, CheckCircle2, X } from "lucide-react"
import { mockVagas, mockCandidaturas, mockUsers } from "@/lib/mock-data"
import type { Vaga as OriginalVaga } from "@/lib/types"

// Extende o tipo Vaga para incluir 'remote' e 'benefits'
type Vaga = OriginalVaga & {
  remote?: boolean
  salaryCurrency?: string
  benefits?: string
}
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
  const [candidaturas, setCandidaturas] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

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
  const [screeningQuestions, setScreeningQuestions] = useState<any[]>([])
  const [vagaCriada, setVagaCriada] = useState<Vaga | null>(null)
  const [showConfirmacao, setShowConfirmacao] = useState(false)
  const [error, setError] = useState("")

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
      
      // GET /api/v1/jobs/ - Busca todas as vagas
      const vagasResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }).catch((err) => {
        console.warn("Erro ao carregar vagas:", err)
        return null
      })

      let vagasData: Vaga[] = []
      if (vagasResponse?.ok) {
        const allVagas = await vagasResponse.json()
        console.log("GET /api/v1/jobs/ - Todas as vagas recebidas:", allVagas)
        console.log("User ID:", user.id, "Tipo:", typeof user.id)
        console.log("User completo:", user)
        
        // Verifica se allVagas é um array
        if (Array.isArray(allVagas)) {
          // Mostra os company_ids das vagas
          console.log("Company IDs das vagas:", allVagas.map(v => ({ id: v.company_id, type: typeof v.company_id })))
          
          // Converte IDs para número para comparação
          const userIdNum = Number(user.id)
          
          // Mapeia e filtra as vagas da empresa atual
          vagasData = allVagas
            .filter((v) => {
              const companyIdNum = Number(v.company_id)
              const match = companyIdNum === userIdNum
              console.log(`Comparando company_id ${v.company_id} (${companyIdNum}) com user.id ${user.id} (${userIdNum}): ${match}`)
              return match
            })
            .map((v: any) => ({
              id: v.id,
              empresaId: v.company_id,
              titulo: v.title || '',
              descricao: v.description || '',
              requisitos: v.requirements || '',
              tipo: v.job_type || 'CLT',
              localizacao: v.location || '',
              salario: v.salary_min && v.salary_max ? `${v.salary_min} - ${v.salary_max}` : '',
              salarioMin: v.salary_min || '',
              salarioMax: v.salary_max || '',
              salaryCurrency: v.salary_currency || 'BRL',
              status: v.status || 'rascunho',
              remote: v.remote || false,
              benefits: v.benefits || '',
              createdAt: v.created_at ? new Date(v.created_at) : new Date(),
            }))
          
          console.log("Vagas mapeadas e filtradas:", vagasData)
          
          // Se não houver vagas filtradas, mostra todas para debug
          if (vagasData.length === 0 && allVagas.length > 0) {
            console.warn("ATENÇÃO: Nenhuma vaga filtrada! Mostrando todas as vagas para debug")
            vagasData = allVagas.map((v: any) => ({
              id: v.id,
              empresaId: v.company_id,
              titulo: v.title || '',
              descricao: v.description || '',
              requisitos: v.requirements || '',
              tipo: v.job_type || 'CLT',
              localizacao: v.location || '',
              salario: v.salary_min && v.salary_max ? `${v.salary_min} - ${v.salary_max}` : '',
              salarioMin: v.salary_min || '',
              salarioMax: v.salary_max || '',
              salaryCurrency: v.salary_currency || 'BRL',
              status: v.status || 'rascunho',
              remote: v.remote || false,
              benefits: v.benefits || '',
              createdAt: v.created_at ? new Date(v.created_at) : new Date(),
            }))
          }
        } else {
          console.warn("allVagas não é um array:", typeof allVagas)
          vagasData = []
        }
      } else {
        console.warn("Erro ao carregar vagas, usando dados mockados")
        vagasData = mockVagas.filter((v) => v.empresaId === user.id)
      }

      // GET /api/v1/candidaturas - Busca estatísticas de candidaturas
      const candidaturasResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }).catch((err) => {
        console.warn("Erro ao carregar candidaturas:", err)
        return null
      })

      let candidaturasData: any[] = []
      if (candidaturasResponse?.ok) {
        const candidaturasStats = await candidaturasResponse.json()
        console.log("GET /api/v1/candidaturas - Estatísticas recebidas:", candidaturasStats)
        // Extrai os top_candidates do response
        candidaturasData = Array.isArray(candidaturasStats.top_candidates) ? candidaturasStats.top_candidates : []
      } else {
        console.warn("Erro ao carregar candidaturas, usando dados mockados")
        candidaturasData = mockCandidaturas.filter((c) => {
          const vaga = mockVagas.find((v) => v.id === c.vagaId)
          return vaga?.empresaId === user.id
        })
      }

      setVagas(vagasData)
      setCandidaturas(candidaturasData)
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

  const minhasVagas = vagas.filter((v) => (v.status === "aberta" ))
  const vagasAbertas = minhasVagas

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
    setError("")

    if (!user) return

    try {
      // Validação básica
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
        
        let errorMessage = `Erro ${response.status} ao criar vaga`
        if (errorData.detail) {
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
        }
        
        throw new Error(errorMessage)
      }

      const novaVaga = await response.json()
      console.log("Vaga criada com sucesso:", novaVaga)

      setVagas([...vagas, novaVaga])

      // Mostrar página de confirmação
      setVagaCriada(novaVaga)
      setShowConfirmacao(true)
      setIsDialogOpen(false)

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
    } catch (err: any) {
      console.error("Erro ao criar vaga:", err)
      console.error("Detalhes do erro:", err.message)
      setError(err?.message || "Erro ao criar vaga. Tente novamente.")
    }
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-secondary/30">
        <EmpresaSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-x-hidden">
          <DashboardHeader />

          {/* Dialog de Confirmação */}
      {showConfirmacao && vagaCriada && (
        <Dialog open={showConfirmacao} onOpenChange={setShowConfirmacao}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl sm:text-2xl">Vaga Criada com Sucesso!</DialogTitle>
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

            <div className="space-y-4 sm:space-y-6">
              {/* Grid com os dados da vaga */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Coluna Esquerda */}
                <div className="space-y-4">
                  <Card className="border-2">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">ID</p>
                        <p className="text-base sm:text-lg font-bold">{vagaCriada.id}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Título</p>
                        <p className="text-base sm:text-lg font-bold break-words">{vagaCriada.titulo}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="text-base sm:text-lg font-bold">{vagaCriada.status}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Tipo de Vaga</p>
                        <p className="text-base sm:text-lg font-bold">{vagaCriada.tipo}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Coluna Direita */}
                <div className="space-y-4">
                  <Card className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Localização</p>
                        <p className="text-lg font-bold">{vagaCriada.localizacao}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Trabalho Remoto</p>
                        <p className="text-lg font-bold">{vagaCriada.remote ? "Sim" : "Não"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Faixa Salarial</p>
                        <p className="text-lg font-bold">
                          {vagaCriada.salarioMin} - {vagaCriada.salarioMax} {vagaCriada.salaryCurrency}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Data de Criação</p>
                        <p className="text-lg font-bold">
                          {new Date(vagaCriada.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Descrição */}
              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Descrição</p>
                    <p className="text-sm">{vagaCriada.descricao}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Requisitos */}
              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Requisitos</p>
                    <p className="text-sm">{vagaCriada.requisitos}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Benefícios */}
              {vagaCriada.benefits && (
                <Card className="border-2">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Benefícios</p>
                      <p className="text-sm">{vagaCriada.benefits}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

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

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Painel da Empresa</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Gerencie suas vagas e candidatos</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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
              <form onSubmit={handleCreateVaga} className="space-y-4 sm:space-y-6">
                {error && (
                  <div className="bg-destructive/10 border border-destructive text-destructive text-sm p-3 rounded-md">
                    {error}
                  </div>
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
                <div className="space-y-4 pb-6">
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

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Criar em Rascunho</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vagas Publicadas</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{minhasVagas.length}</div>
              <p className="text-xs text-muted-foreground">Ativas no momento</p>
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
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <CardTitle className="text-base sm:text-lg truncate">{vaga.titulo}</CardTitle>
                              <Badge variant={getStatusBadge(vaga.status)} className="text-xs">{getStatusLabel(vaga.status)}</Badge>
                              <Badge variant="outline" className="text-xs">{vaga.tipo}</Badge>
                            </div>
                            <CardDescription className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{vaga.localizacao}</span>
                              </span>
                              {(vaga.salarioMin || vaga.salarioMax) && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {vaga.salarioMin} - {vaga.salarioMax} {vaga.salaryCurrency}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {candidaturasVaga.length} candidatos
                              </span>
                            </CardDescription>
                          </div>
                          <div className="flex gap-2 self-start">
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
      </div>
    </SidebarProvider>
  )
}
