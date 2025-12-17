"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, MapPin, Briefcase, DollarSign, Clock, Filter, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { CandidatoSidebar } from "@/components/candidato-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarProvider } from "@/components/ui/sidebar"

type Vaga = {
  id: string | number
  titulo: string
  empresaNome: string
  descricao: string
  localizacao: string
  tipo: string
  salario?: string
  salarioMin?: number
  salarioMax?: number
  requisitos: string
  beneficios?: string
  remote?: boolean
  empresaLogo?: string
  habilidadesRequeridas?: string[]
  anosExperienciaMin?: number
  status: string
  createdAt: Date
  scoreCompatibilidade?: number
  habilidadesFaltando?: string[]
}

type AutoavaliacaoCandidato = {
  habilidade: string
  nivel: number
  descricao?: string
}

type PerfilCandidato = {
  id: string | number
  nome: string
  email: string
  cidade?: string
  estado?: string
  anosExperiencia?: number
  [key: string]: any
}

export default function VagasPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [vagasRecomendadas, setVagasRecomendadas] = useState<Vaga[]>([])
  const [todasAsVagas, setTodasAsVagas] = useState<Vaga[]>([])
  const [vagasFiltradas, setVagasFiltradas] = useState<Vaga[]>([])
  const [loadingRecomendadas, setLoadingRecomendadas] = useState(true)
  const [loadingVagas, setLoadingVagas] = useState(true)
  const [candidatoPerfil, setCandidatoPerfil] = useState<PerfilCandidato | null>(null)
  const [autoavaliacao, setAutoavaliacao] = useState<AutoavaliacaoCandidato[]>([])

  // Estados de filtro
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("Todos")
  const [selectedLocation, setSelectedLocation] = useState("Todos")
  const [showFilters, setShowFilters] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // Carregar perfil do candidato e autoavaliação
  const loadPerfil = async () => {
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
        const perfil = await response.json()
        setCandidatoPerfil(perfil)
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
    }
  }

  // Carregar autoavaliação do candidato
  const loadAutoavaliacao = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${apiUrl}/api/v1/autoavaliacao/minha`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const habilidades = data.respostas || []
        setAutoavaliacao(habilidades)
      }
    } catch (error) {
      console.error("Erro ao carregar autoavaliação:", error)
    }
  }

  // Calcular compatibilidade entre candidato e vaga
  const calcularCompatibilidade = (vaga: Vaga): { score: number; habilidadesFaltando: string[] } => {
    if (!candidatoPerfil || autoavaliacao.length === 0) {
      return { score: 0, habilidadesFaltando: [] }
    }

    let scoreHabilidades = 0
    let habilidadesFaltando: string[] = []

    // Usar habilidades já extraídas ou extrair novamente
    const habilidadesRequeridas = vaga.habilidadesRequeridas || extrairHabilidades(`${vaga.titulo} ${vaga.descricao} ${vaga.requisitos}`)

    // Comparar habilidades
    const habilidadesDosCandidato = autoavaliacao.map(a => a.habilidade.toLowerCase())
    
    if (habilidadesRequeridas.length > 0) {
      const habilidadesPresentes = habilidadesRequeridas.filter(h => 
        habilidadesDosCandidato.some(hc => hc.includes(h) || h.includes(hc))
      ).length
      
      scoreHabilidades = (habilidadesPresentes / habilidadesRequeridas.length) * 50
      
      habilidadesFaltando = habilidadesRequeridas.filter(h =>
        !habilidadesDosCandidato.some(hc => hc.includes(h) || h.includes(hc))
      )
    } else {
      scoreHabilidades = 30 // Score padrão se não há habilidades específicas
    }

    // Score de localização (30%)
    let scoreLocalizacao = 0
    if (vaga.remote) {
      scoreLocalizacao = 30 // Score máximo para remoto
    } else if (candidatoPerfil.cidade && vaga.localizacao) {
      const localVaga = vaga.localizacao.toLowerCase()
      const cidadeCandidato = candidatoPerfil.cidade.toLowerCase()
      const estadoCandidato = candidatoPerfil.estado?.toLowerCase() || ""
      
      if (cidadeCandidato === localVaga.split(",")[0]?.toLowerCase()) {
        scoreLocalizacao = 30 // Mesma cidade
      } else if (estadoCandidato && localVaga.includes(estadoCandidato)) {
        scoreLocalizacao = 20 // Mesmo estado
      } else {
        scoreLocalizacao = 10 // Estados diferentes
      }
    } else {
      scoreLocalizacao = 15 // Score padrão se info incompleta
    }

    // Score de experiência (20%)
    let scoreExperiencia = 0
    if (vaga.anosExperienciaMin) {
      const anosExp = candidatoPerfil.anosExperiencia || 0
      if (anosExp >= vaga.anosExperienciaMin) {
        scoreExperiencia = 20 // Atende requisito
      } else if (anosExp >= (vaga.anosExperienciaMin * 0.7)) {
        scoreExperiencia = 12 // Próximo ao requisito
      } else {
        scoreExperiencia = 5 // Abaixo do requisito
      }
    } else {
      scoreExperiencia = 15 // Score padrão se não há requisito
    }

    const scoreTotal = Math.min(100, scoreHabilidades + scoreLocalizacao + scoreExperiencia)

    return {
      score: Math.round(scoreTotal),
      habilidadesFaltando: Array.from(new Set(habilidadesFaltando))
    }
  }

  // Carregar vagas recomendadas com scoring
  const loadVagasRecomendadas = async () => {
    try {
      setLoadingRecomendadas(true)
      const token = localStorage.getItem("token")

      // Se tem autoavaliação, usa scoring inteligente
      if (autoavaliacao.length > 0 && todasAsVagas.length > 0) {
        const vagasComScore = todasAsVagas.map(vaga => {
          const { score, habilidadesFaltando } = calcularCompatibilidade(vaga)
          return {
            ...vaga,
            scoreCompatibilidade: score,
            habilidadesFaltando
          }
        })

        // Ordenar por score descendente e limitar a 50
        const vagasOrdenadas = vagasComScore
          .sort((a, b) => (b.scoreCompatibilidade || 0) - (a.scoreCompatibilidade || 0))
          .slice(0, 50)
          .filter(v => (v.scoreCompatibilidade || 0) >= 30) // Apenas 30% de compatibilidade mínima

        setVagasRecomendadas(vagasOrdenadas)
      } else {
        // Fallback: carregar do endpoint se houver
        if (token) {
          const response = await fetch(`${apiUrl}/api/v1/vagas/recomendadas`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            const vagas = Array.isArray(data) ? data : data.vagas || data.data || []
            setVagasRecomendadas(vagas)
          } else {
            setVagasRecomendadas([])
          }
        } else {
          setVagasRecomendadas([])
        }
      }
    } catch (error) {
      console.error("Erro ao carregar vagas recomendadas:", error)
      setVagasRecomendadas([])
    } finally {
      setLoadingRecomendadas(false)
    }
  }

  // Extrair habilidades de um texto
  const extrairHabilidades = (texto: string): string[] => {
    const habilidadesComuns = ["python", "javascript", "typescript", "react", "nodejs", "sql", "java", "c#", "php", "ruby", "go", "rust", "kotlin", "swift"]
    const textoLower = texto?.toLowerCase() || ""
    return habilidadesComuns.filter(h => textoLower.includes(h))
  }

  // Carregar todas as vagas
  const loadTodasAsVagas = async () => {
    try {
      setLoadingVagas(true)
      const response = await fetch(`${apiUrl}/api/v1/jobs/disponibles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = (await response.json()) as any
        const vagasData = Array.isArray(data) ? data : data.vagas || data.data || []
        
        // Mapear campos da API para o tipo Vaga
        const vagasMapeadas = vagasData.map((v: any) => {
          const habilidades = extrairHabilidades(`${v.title} ${v.description} ${v.requirements}`)
          const anosExpMatch = v.requirements?.match(/(\d+)\+?\s*anos/)
          
          return {
            id: v.id,
            titulo: v.title,
            empresaNome: v.company_name,
            descricao: v.description,
            localizacao: v.location,
            tipo: v.job_type,
            salario: v.salary_min && v.salary_max ? `${v.salary_min} - ${v.salary_max} ${v.salary_currency || 'BRL'}` : '',
            salarioMin: v.salary_min,
            salarioMax: v.salary_max,
            requisitos: v.requirements,
            beneficios: v.benefits,
            remote: v.remote,
            empresaLogo: v.company_logo,
            status: v.status,
            createdAt: new Date(v.created_at),
            habilidadesRequeridas: habilidades,
            anosExperienciaMin: anosExpMatch ? parseInt(anosExpMatch[1]) : undefined,
          }
        })
        
        setTodasAsVagas(vagasMapeadas)
        setVagasFiltradas(vagasMapeadas)
      } else {
        console.error("Erro ao carregar vagas:", response.statusText)
      }
    } catch (error) {
      console.error("Erro ao carregar vagas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vagas",
        variant: "destructive",
      })
    } finally {
      setLoadingVagas(false)
    }
  }

  // Aplicar filtros
  useEffect(() => {
    let filtered = todasAsVagas

    if (searchQuery) {
      filtered = filtered.filter(
        (vaga) =>
          vaga.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vaga.empresaNome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vaga.descricao.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedType !== "Todos") {
      filtered = filtered.filter((vaga) => vaga.tipo === selectedType)
    }

    if (selectedLocation !== "Todos") {
      filtered = filtered.filter((vaga) => vaga.localizacao === selectedLocation)
    }

    setVagasFiltradas(filtered)
  }, [searchQuery, selectedType, selectedLocation, todasAsVagas])

  // Extrair localizações únicas
  const localizacoes = ["Todos", ...Array.from(new Set(todasAsVagas.map((v) => v.localizacao)))]
  const tipos = [
    "Todos",
    ...Array.from(new Set(todasAsVagas.map((v) => v.tipo))),
  ]

  // Carregar dados na montagem
  useEffect(() => {
    loadTodasAsVagas()
    loadPerfil()
    loadAutoavaliacao()
  }, [])

  // Carregar vagas recomendadas quando perfil ou autoavaliação mudam
  useEffect(() => {
    if (todasAsVagas.length > 0) {
      loadVagasRecomendadas()
    }
  }, [autoavaliacao, candidatoPerfil])

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedType("Todos")
    setSelectedLocation("Todos")
  }

  return (
    <SidebarProvider>
      <CandidatoSidebar />
      <div className="min-h-screen flex flex-col bg-secondary/30 w-full">
        <DashboardHeader />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Vagas Públicas</h2>
            <p className="text-muted-foreground">Encontre a oportunidade perfeita para sua carreira</p>
          </div>

          {/* Seção de Vagas Recomendadas */}
          {vagasRecomendadas.length > 0 && (
            <section className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  Vagas Recomendadas para Você
                </h2>
                <p className="text-muted-foreground">
                  Baseado no seu perfil e localização
                </p>
              </div>

              {loadingRecomendadas ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-48 bg-muted rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vagasRecomendadas.slice(0, 4).map((vaga) => (
                    <Card
                      key={vaga.id}
                      className="hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
                      onClick={() => router.push(`/vagas/${vaga.id}`)}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                              {vaga.titulo}
                            </h3>
                            <p className="text-muted-foreground text-sm">{vaga.empresaNome}</p>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge
                              variant={vaga.tipo.includes("Temporário") ? "secondary" : "default"}
                              className="whitespace-nowrap"
                            >
                              {vaga.tipo}
                            </Badge>
                            {vaga.scoreCompatibilidade !== undefined && (
                              <Badge
                                variant={
                                  vaga.scoreCompatibilidade >= 70
                                    ? "default"
                                    : vaga.scoreCompatibilidade >= 40
                                      ? "secondary"
                                      : "outline"
                                }
                                className="whitespace-nowrap"
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                {vaga.scoreCompatibilidade}% match
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-muted-foreground text-sm">
                            <MapPin className="w-4 h-4 mr-2" />
                            {vaga.localizacao}
                          </div>

                          {vaga.salario && (
                            <div className="flex items-center text-muted-foreground text-sm">
                              <DollarSign className="w-4 h-4 mr-2" />
                              {vaga.salario}
                            </div>
                          )}

                          {vaga.anosExperienciaMin && (
                            <div className="flex items-center text-muted-foreground text-sm">
                              <Briefcase className="w-4 h-4 mr-2" />
                              {vaga.anosExperienciaMin}+ anos de experiência
                            </div>
                          )}
                        </div>

                        <p className="text-foreground text-sm line-clamp-2 mb-4">
                          {vaga.descricao}
                        </p>

                        {vaga.habilidadesRequeridas && vaga.habilidadesRequeridas.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {vaga.habilidadesRequeridas.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {vaga.habilidadesRequeridas.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{vaga.habilidadesRequeridas.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {vaga.habilidadesFaltando && vaga.habilidadesFaltando.length > 0 && (
                          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-md">
                            <p className="text-xs font-semibold text-orange-900 dark:text-orange-200 mb-2">
                              Habilidades que você não tem:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {vaga.habilidadesFaltando.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200">
                                  {skill}
                                </Badge>
                              ))}
                              {vaga.habilidadesFaltando.length > 3 && (
                                <Badge variant="outline" className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200">
                                  +{vaga.habilidadesFaltando.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <Button
                          asChild
                          className="w-full"
                        >
                          <Link href={`/vagas/${vaga.id}`}>Ver Detalhes</Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Seção de Filtros e Busca */}
          <section className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Buscar por cargo, empresa ou habilidade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="md:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>

            {showFilters && (
              <Card className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Tipo de Vaga
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {tipos.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Localização
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {localizacoes.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {vagasFiltradas.length} de {todasAsVagas.length} vagas
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </Card>
            )}
          </section>

          {/* Seção de Todas as Vagas */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                Todas as Vagas
              </h2>
              <p className="text-muted-foreground">
                {vagasFiltradas.length} vaga{vagasFiltradas.length !== 1 ? "s" : ""} encontrada
                {vagasFiltradas.length !== 1 ? "s" : ""}
              </p>
            </div>

            {loadingVagas ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-40 bg-muted rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            ) : vagasFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {vagasFiltradas.map((vaga) => (
                  <Card
                    key={vaga.id}
                    className="hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer group"
                    onClick={() => router.push(`/vagas/${vaga.id}`)}
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-1">
                            {vaga.titulo}
                          </h3>
                          <p className="text-muted-foreground font-medium">{vaga.empresaNome}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-start md:items-end mt-2 md:mt-0">
                          <Badge
                            variant={vaga.tipo.includes("Temporário") ? "secondary" : "default"}
                            className="whitespace-nowrap"
                          >
                            {vaga.tipo}
                          </Badge>
                          {vaga.scoreCompatibilidade !== undefined && (
                            <Badge
                              variant={
                                vaga.scoreCompatibilidade >= 70
                                  ? "default"
                                  : vaga.scoreCompatibilidade >= 40
                                    ? "secondary"
                                    : "outline"
                              }
                              className="whitespace-nowrap"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              {vaga.scoreCompatibilidade}% match
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-muted-foreground text-sm">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{vaga.localizacao}</span>
                        </div>

                        {vaga.salario && (
                          <div className="flex items-center text-muted-foreground text-sm">
                            <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{vaga.salario}</span>
                          </div>
                        )}

                        {vaga.anosExperienciaMin && (
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{vaga.anosExperienciaMin}+ anos</span>
                          </div>
                        )}

                        <div className="flex items-center text-muted-foreground text-sm">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>
                            {new Date(vaga.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>

                      <p className="text-foreground mb-4 line-clamp-2">
                        {vaga.descricao}
                      </p>

                      {vaga.habilidadesRequeridas && vaga.habilidadesRequeridas.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {vaga.habilidadesRequeridas.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {vaga.habilidadesRequeridas.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{vaga.habilidadesRequeridas.length - 5}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          asChild
                          variant="outline"
                        >
                          <Link href={`/vagas/${vaga.id}`}>Ver Detalhes</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhuma vaga encontrada
                </h3>
                <p className="text-muted-foreground mb-6">
                  Tente ajustar seus filtros de busca
                </p>
                <Button
                  onClick={handleClearFilters}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </section>
        </main>
      </div>
    </SidebarProvider>
  )
}
