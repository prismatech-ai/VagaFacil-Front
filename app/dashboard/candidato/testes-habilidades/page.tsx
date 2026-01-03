"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { COMPETENCIAS_DISPONIVEIS, type CompetenciasPorCategoria, type Competencia } from "@/lib/competencias"

interface CandidatoData {
  id: number
  full_name: string
  habilidades: Array<{
    habilidade: string
    nivel: number
    anos_experiencia: number
  }>
  teste_habilidades_completado: boolean
  score_teste_habilidades: number
}

export default function TestesHabilidadesPage() {
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [candidato, setCandidato] = useState<CandidatoData | null>(null)
  
  const [competenciasEscolhidas, setCompetenciasEscolhidas] = useState<Map<string, number>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Only load data when auth is ready and user is logged in
    if (!authLoading && user) {
      carregarDados()
    }
  }, [authLoading, user])

  const carregarDados = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      try {
        const data = await api.get<CandidatoData>("/api/v1/candidates/onboarding/dados-profissionais")
        console.log("📋 Dados de competências carregados:", data)
        
        setCandidato(data)
        
        // Carregar competências já selecionadas
        if (data.habilidades && data.habilidades.length > 0) {
          const mapa = new Map<string, number>()
          data.habilidades.forEach((h) => {
            mapa.set(h.habilidade, h.nivel)
          })
          setCompetenciasEscolhidas(mapa)
        }
      } catch (fetchErr: any) {
        console.error("Erro ao fazer requisição:", fetchErr)
        // Inicializar com valores padrão em caso de erro
        setCandidato({
          id: 0,
          full_name: "Você",
          habilidades: [],
          teste_habilidades_completado: false,
          score_teste_habilidades: 0,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCompetencia = (nome: string) => {
    const novasCompetencias = new Map(competenciasEscolhidas)
    
    if (novasCompetencias.has(nome)) {
      novasCompetencias.delete(nome)
    } else {
      novasCompetencias.set(nome, 5) // Nível padrão
    }
    
    setCompetenciasEscolhidas(novasCompetencias)
  }

  const atualizarNivel = (nome: string, nivel: number) => {
    const novasCompetencias = new Map(competenciasEscolhidas)
    novasCompetencias.set(nome, nivel)
    setCompetenciasEscolhidas(novasCompetencias)
  }

  const getUserIdFromToken = (token: string): string | null => {
    try {
      const payload = token.split(".")[1]
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      const data = JSON.parse(json)
      return data?.sub || data?.user_id || data?.id || null
    } catch {
      return null
    }
  }

  const salvarAutoavaliacao = async () => {
    if (competenciasEscolhidas.size === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma competência",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const habilidades = Array.from(competenciasEscolhidas.entries()).map(([nome, nivel]) => ({
        habilidade: nome,
        nivel: nivel,
        anos_experiencia: 0,
      }))

      const payload = {
        habilidades: habilidades,
      }

      console.log("📋 Salvando autoavaliação:", payload)

      await api.post("/api/v1/candidates/onboarding/dados-profissionais", payload)

      console.log("✅ Autoavaliação salva com sucesso")
      
      toast({
        title: "Sucesso",
        description: "Competências salvas! Você completou a autoavaliação.",
      })

      // Recarregar dados
      await carregarDados()
    } catch (err: any) {
      console.error("Erro ao salvar autoavaliação:", err)
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testes de Habilidades</h1>
          <p className="text-gray-600 mt-2">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testes de Habilidades</h1>
        </div>
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#03565C] to-[#24BFB0] text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Autoavaliação de Competências</h1>
        <p className="text-lg opacity-90">
          Selecione as competências em que você tem conhecimento e indique seu nível (2-3 minutos)
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {competenciasEscolhidas.size} competência(s) selecionada(s)
          </span>
          <span className="text-sm text-gray-500">Autoavaliação</span>
        </div>
        <Progress value={(competenciasEscolhidas.size / 20) * 100} className="h-2" />
      </div>

      {/* Competências por Categoria */}
      <div className="space-y-8">
        {Object.entries(COMPETENCIAS_DISPONIVEIS).map(([categoria, competencias]) => (
          <div key={categoria}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{categoria}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competencias.map((comp) => {
                const isSelected = competenciasEscolhidas.has(comp.nome)
                const nivel = competenciasEscolhidas.get(comp.nome) || 5

                return (
                  <Card
                    key={comp.nome}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#03565C] bg-[#03565C]/5 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleCompetencia(comp.nome)}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 flex-1">{comp.nome}</h3>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-[#03565C] flex-shrink-0 mt-1" />
                          )}
                        </div>

                        {isSelected && (
                          <div className="space-y-2 pt-3 border-t">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <Label className="text-sm">Nível de Proficiência</Label>
                                <span className="text-sm font-semibold text-[#03565C]">{nivel}/10</span>
                              </div>
                              <Slider
                                value={[nivel]}
                                onValueChange={(value) => atualizarNivel(comp.nome, value[0])}
                                min={1}
                                max={10}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}

                        {!isSelected && (
                          <p className="text-xs text-gray-500 italic">
                            Clique para adicionar à sua lista
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex gap-3 pt-6">
        <Button
          onClick={salvarAutoavaliacao}
          disabled={isSubmitting || competenciasEscolhidas.size === 0}
          className="gap-2 bg-[#03565C] hover:bg-[#024147] px-8"
        >
          {isSubmitting ? "Salvando..." : "Salvar Autoavaliação"}
          {competenciasEscolhidas.size > 0 && (
            <CheckCircle2 className="h-4 w-4" />
          )}
        </Button>
        <Button variant="outline">Cancelar</Button>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          Selecione suas competências técnicas e indique seu nível de conhecimento. Isso ajudará as empresas a encontrar oportunidades mais adequadas para você.
        </AlertDescription>
      </Alert>
    </div>
  )
}
