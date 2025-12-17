"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  AlertCircle,
  CheckCircle,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { CandidatoSidebar } from "@/components/candidato-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarProvider } from "@/components/ui/sidebar"

type Vaga = {
  id: string | number
  titulo: string
  empresaNome: string
  descricao: string
  requisitos: string
  localizacao: string
  tipo: string
  salario?: string
  salarioMin?: number
  salarioMax?: number
  habilidadesRequeridas?: string[]
  anosExperienciaMin?: number
  anosExperienciaMax?: number
  status: string
  createdAt: Date
  beneficios?: string
  remote?: boolean
  empresaLogo?: string
}

export default function VagaDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [vaga, setVaga] = useState<Vaga | null>(null)
  const [loading, setLoading] = useState(true)
  const [candidato, setCandidato] = useState<any>(null)
  const [jaSeInscreve, setJaSeInscreve] = useState(false)
  const [inscrevendo, setInscrevendo] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  // Carregar detalhes da vaga
  const loadVagaDetalhes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${apiUrl}/api/v1/jobs/disponibles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = (await response.json()) as any
        const vagasData = Array.isArray(data) ? data : data.vagas || data.data || []
        
        // Encontrar a vaga pelo ID
        const vagaEncontrada = vagasData.find((v: any) => String(v.id) === String(params.id))
        
        if (vagaEncontrada) {
          const vagaFormatada: Vaga = {
            id: vagaEncontrada.id,
            titulo: vagaEncontrada.title,
            empresaNome: vagaEncontrada.company_name,
            descricao: vagaEncontrada.description,
            requisitos: vagaEncontrada.requirements,
            localizacao: vagaEncontrada.location,
            tipo: vagaEncontrada.job_type,
            salario: vagaEncontrada.salary_min && vagaEncontrada.salary_max ? 
              `${vagaEncontrada.salary_min} - ${vagaEncontrada.salary_max} ${vagaEncontrada.salary_currency || 'BRL'}` : '',
            salarioMin: vagaEncontrada.salary_min,
            salarioMax: vagaEncontrada.salary_max,
            status: vagaEncontrada.status,
            createdAt: new Date(vagaEncontrada.created_at),
            beneficios: vagaEncontrada.benefits,
            remote: vagaEncontrada.remote,
            empresaLogo: vagaEncontrada.company_logo,
          }
          setVaga(vagaFormatada)
        } else {
          toast({
            title: "Erro",
            description: "Vaga não encontrada",
            variant: "destructive",
          })
          router.push("/vagas")
        }
      } else {
        toast({
          title: "Erro",
          description: "Vaga não encontrada",
          variant: "destructive",
        })
        router.push("/vagas")
      }
    } catch (error) {
      console.error("Erro ao carregar vaga:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da vaga",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Carregar candidato logado
  const loadCandidato = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${apiUrl}/api/v1/candidates/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = (await response.json()) as any
        setCandidato(data)
        checkJaSeInscreve(data.id)
      }
    } catch (error) {
      console.error("Erro ao carregar candidato:", error)
    }
  }

  // Verificar se já se inscreveu
  const checkJaSeInscreve = async (candidatoId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${apiUrl}/api/v1/candidaturas?job_id=${params.id}&candidate_id=${candidatoId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = (await response.json()) as any
        const candidaturas = Array.isArray(data) ? data : data.candidaturas || []
        setJaSeInscreve(candidaturas.length > 0)
      }
    } catch (error) {
      console.error("Erro ao verificar candidatura:", error)
    }
  }

  // Candidatar-se à vaga
  const handleCandidatar = async () => {
    const token = localStorage.getItem("token")
    
    if (!token) {
      toast({
        title: "Autenticação Necessária",
        description: "Você precisa estar logado para se candidatar",
        variant: "default",
      })
      router.push("/login")
      return
    }

    try {
      setInscrevendo(true)
      
      // Usar a rota correta: POST /api/v1/jobs/{job_id}/candidatar
      const response = await fetch(`${apiUrl}/api/v1/jobs/${params.id}/candidatar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cover_letter: "",
        }),
      })

      if (response.status === 201 || response.ok) {
        const data = await response.json()
        setJaSeInscreve(true)
        toast({
          title: "Sucesso! 🎉",
          description: `Sua candidatura foi enviada! ID: ${data.application_id}`,
        })
      } else if (response.status === 400) {
        const error = await response.json()
        toast({
          title: "Candidatura Inválida",
          description: error.message || "Você já se candidatou para esta vaga ou ela está encerrada",
          variant: "destructive",
        })
      } else if (response.status === 401) {
        toast({
          title: "Sessão Expirada",
          description: "Sua sessão expirou. Faça login novamente",
          variant: "destructive",
        })
        router.push("/login")
      } else {
        const error = await response.json().catch(() => ({}))
        toast({
          title: "Erro",
          description: error.message || "Não foi possível se candidatar",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao candidatar:", error)
      toast({
        title: "Erro de Conexão",
        description: "Ocorreu um erro ao se candidatar. Tente novamente",
        variant: "destructive",
      })
    } finally {
      setInscrevendo(false)
    }
  }

  // Compartilhar vaga
  const handleCompartilhar = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copiado!",
      description: "O link da vaga foi copiado para a área de transferência",
    })
  }

  useEffect(() => {
    loadVagaDetalhes()
    loadCandidato()
  }, [params.id])

  if (loading) {
    return (
      <SidebarProvider>
        <CandidatoSidebar />
        <div className="min-h-screen bg-secondary/30 flex flex-col w-full">
          <DashboardHeader />
          <div className="flex-1">
            <div className="container mx-auto px-4 py-8">
              <Skeleton className="h-10 w-32 mb-8" />
              <Skeleton className="h-64 w-full mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Skeleton className="h-96 col-span-2" />
                <Skeleton className="h-96" />
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  if (!vaga) {
    return (
      <SidebarProvider>
        <CandidatoSidebar />
        <div className="min-h-screen bg-secondary/30 flex flex-col w-full">
          <DashboardHeader />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Vaga não encontrada</h1>
              <p className="text-muted-foreground mb-6">A vaga que você procura não existe mais</p>
              <Button asChild>
                <Link href="/vagas">Voltar às Vagas</Link>
              </Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <CandidatoSidebar />
      <div className="min-h-screen bg-secondary/30 flex flex-col w-full">
        <DashboardHeader />

        <main className="flex-1 container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            {/* Card Principal */}
            <Card className="mb-8 p-8">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      {vaga.titulo}
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium">{vaga.empresaNome}</p>
                  </div>
                  <Badge
                    variant={vaga.tipo.includes("Temporário") ? "secondary" : "default"}
                    className="whitespace-nowrap h-fit"
                  >
                    {vaga.tipo}
                  </Badge>
                </div>
              </div>

              {/* Informações Principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b">
                <div>
                  <div className="flex items-center text-muted-foreground mb-1">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-sm font-semibold">Localização</span>
                  </div>
                  <p className="font-bold">{vaga.localizacao}</p>
                </div>

                {vaga.remote && (
                  <div>
                    <div className="flex items-center text-muted-foreground mb-1">
                      <Briefcase className="w-5 h-5 mr-2" />
                      <span className="text-sm font-semibold">Modalidade</span>
                    </div>
                    <p className="font-bold">Remoto</p>
                  </div>
                )}

                {vaga.salario && (
                  <div>
                    <div className="flex items-center text-muted-foreground mb-1">
                      <DollarSign className="w-5 h-5 mr-2" />
                      <span className="text-sm font-semibold">Salário</span>
                    </div>
                    <p className="font-bold">{vaga.salario}</p>
                  </div>
                )}

                <div>
                  <div className="flex items-center text-muted-foreground mb-1">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="text-sm font-semibold">Publicada</span>
                  </div>
                  <p className="font-bold">
                    {new Date(vaga.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              {/* Descrição */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  Sobre a Vaga
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-line">
                    {vaga.descricao}
                  </p>
                </div>
              </section>

              {/* Requisitos */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  Requisitos
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-line">
                    {vaga.requisitos}
                  </p>
                </div>
              </section>

              {/* Benefícios */}
              {vaga.beneficios && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">
                    Benefícios
                  </h2>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground whitespace-pre-line">
                      {vaga.beneficios}
                    </p>
                  </div>
                </section>
              )}

              {/* Habilidades Requeridas */}
              {vaga.habilidadesRequeridas && vaga.habilidadesRequeridas.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">
                    Habilidades Requeridas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {vaga.habilidadesRequeridas.map((skill, index) => (
                      <Badge key={index}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              {/* Status da Inscrição */}
              {jaSeInscreve && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">
                      Você já se candidatou
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Boa sorte! A empresa entrará em contato em breve.
                    </p>
                  </div>
                </div>
              )}

              {/* Botão de Candidatura */}
              {!jaSeInscreve ? (
                <Button
                  onClick={handleCandidatar}
                  disabled={inscrevendo}
                  className="w-full font-bold py-3 mb-4"
                >
                  {inscrevendo ? "Candidatando..." : "Se Candidatar"}
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full font-bold py-3 mb-4"
                >
                  Já Se Candidatou
                </Button>
              )}

              {/* Informações Adicionais */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">
                    Status da Vaga
                  </p>
                  <Badge
                    variant={vaga.status === "aberta" ? "default" : "secondary"}
                    className="w-full text-center justify-center"
                  >
                    {vaga.status === "aberta" ? "Aberta" : "Fechada"}
                  </Badge>
                </div>

                {vaga.salarioMin && vaga.salarioMax && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                      Faixa Salarial
                    </p>
                    <p className="font-bold">
                      R$ {vaga.salarioMin.toLocaleString("pt-BR")} - R${" "}
                      {vaga.salarioMax.toLocaleString("pt-BR")}
                    </p>
                  </div>
                )}

                {vaga.anosExperienciaMax && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                      Experiência Máxima
                    </p>
                    <p className="font-bold">
                      Até {vaga.anosExperienciaMax} anos
                    </p>
                  </div>
                )}
              </div>

              {/* Ajuda */}
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-xs text-muted-foreground mb-3">
                  ⚠️ Dúvida ou problema com essa vaga?
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href="/suporte">Contate o Suporte</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Botão Compartilhar flutuante */}
        <div className="fixed bottom-8 right-8">
          <Button
            onClick={handleCompartilhar}
            size="lg"
            className="rounded-full shadow-lg"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </main>
      </div>
    </SidebarProvider>
  )
}
