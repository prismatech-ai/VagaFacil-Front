"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ChevronRight } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { getAreaById, TODAS_AREAS } from "@/lib/areas-competencias"

interface CandidatoData {
  id: number
  full_name: string
  area_atuacao: string
}

interface CompetenciaComNivel {
  habilidade: string
  nivel: number
  descricao?: string
}

type Step = "autoavaliacao" | "testes"

export default function TestesHabilidadesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [step, setStep] = useState<Step>("autoavaliacao")
  const [candidato, setCandidato] = useState<CandidatoData | null>(null)
  const [competenciasDisponiveis, setCompetenciasDisponiveis] = useState<any[]>([])
  
  const [competenciasEscolhidas, setCompetenciasEscolhidas] = useState<Map<string, CompetenciaComNivel>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoavaliacaoAnterior, setAutoavaliacaoAnterior] = useState<any>(null)
  const [testeEmAndamento, setTesteEmAndamento] = useState<{ habilidade: string; questoes: any[] } | null>(null)
  const [isLoadingQuestoes, setIsLoadingQuestoes] = useState<string | null>(null)

  useEffect(() => {
    // Only load data when auth is ready and user is logged in
    if (!authLoading && user) {
      carregarDados()
    }
  }, [authLoading, user])

  const normalizarString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
  }

  const carregarDados = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      try {
        const data = await api.get<CandidatoData>("/api/v1/candidates/me")
     
        setCandidato(data)
        
        // Buscar competências relacionadas à area_atuacao do candidato
        if (data.area_atuacao) {
        
          // Tentar primeiro como ID, depois como nome (com normalização)
          let area = getAreaById(data.area_atuacao)
          
          if (!area) {
          
            const areaNormalizada = normalizarString(data.area_atuacao)
          
            
            area = TODAS_AREAS.find(a => 
              normalizarString(a.nome) === areaNormalizada || 
              normalizarString(a.id) === areaNormalizada
            )
          }
          
        
          
          if (area) {
            // Flatten competências de todas as categorias
            const competencias = area.categorias.flatMap(cat => cat.competencias)
           
            setCompetenciasDisponiveis(competencias)
            
            // Carregar autoavaliação anterior se existir
            try {
              const autoavaliacao = await api.get<any>("api/v1/autoavaliacao/minha")
             
              setAutoavaliacaoAnterior(autoavaliacao)
              
              // Popular competências escolhidas com os dados anteriores
              if (autoavaliacao && autoavaliacao.respostas && Array.isArray(autoavaliacao.respostas)) {
                const mapa = new Map<string, CompetenciaComNivel>()
                autoavaliacao.respostas.forEach((resposta: any) => {
                  mapa.set(resposta.habilidade, {
                    habilidade: resposta.habilidade,
                    nivel: resposta.nivel,
                    descricao: resposta.descricao || ""
                  })
                })
                setCompetenciasEscolhidas(mapa)
                // Se já tem autoavaliação anterior, ir direto para testes
                setStep("testes")
              }
            } catch (autoErr: any) {
              
              // Isto é esperado na primeira vez - não é erro
            }
          } else {
           
            setError("Área de atuação não encontrada no sistema")
          }
        } else {
          setError("Área de atuação não definida. Complete seu perfil primeiro.")
        }
      } catch (fetchErr: any) {
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do candidato",
          variant: "destructive",
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
      novasCompetencias.set(nome, {
        habilidade: nome,
        nivel: 3, // Nível padrão: Intermediário
        descricao: ""
      })
    }
    
    setCompetenciasEscolhidas(novasCompetencias)
  }

  const atualizarNivel = (nome: string, nivel: number) => {
    const novasCompetencias = new Map(competenciasEscolhidas)
    const competencia = novasCompetencias.get(nome)
    if (competencia) {
      novasCompetencias.set(nome, { ...competencia, nivel })
    }
    setCompetenciasEscolhidas(novasCompetencias)
  }

  const atualizarDescricao = (nome: string, descricao: string) => {
    const novasCompetencias = new Map(competenciasEscolhidas)
    const competencia = novasCompetencias.get(nome)
    if (competencia) {
      novasCompetencias.set(nome, { ...competencia, descricao })
    }
    setCompetenciasEscolhidas(novasCompetencias)
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
      const respostas = Array.from(competenciasEscolhidas.values()).map(comp => ({
        habilidade: comp.habilidade,
        nivel: comp.nivel,
        ...(comp.descricao && { descricao: comp.descricao })
      }))

      const payload = {
        respostas: respostas
      }

    
      // Se já tem autoavaliação anterior, fazer PUT para atualizar; senão fazer POST
      if (autoavaliacaoAnterior) {
      
        await api.post(`api/v1/autoavaliacao/salvar`, payload)
        toast({
          title: "✅ Sucesso",
          description: "Competências atualizadas! Retornando aos testes.",
          variant: "default"
        })
      } else {
        await api.post("/api/v1/autoavaliacao/salvar", payload)
        toast({
          title: "✅ Sucesso",
          description: "Competências salvas! Você completou a autoavaliação.",
          variant: "default"
        })
      }

      // Avançar para a próxima etapa
      setStep("testes")
    } catch (err: any) {
      toast({
        title: "❌ Erro",
        description: err.message || "Erro ao salvar autoavaliação",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const buscarQuestoes = async (habilidade: string) => {
    setIsLoadingQuestoes(habilidade)
    try {
      const response = await api.get<any>(`/api/v1/candidates/testes/questoes/filtrar?habilidade=${encodeURIComponent(habilidade)}`)
 
      
      setTesteEmAndamento({
        habilidade: habilidade,
        questoes: response?.questoes || []
      })
      
      toast({
        title: "✅ Questões Carregadas",
        description: `${response?.quantidade_retornada || 0} questões para ${habilidade}`,
        variant: "default"
      })
    } catch (err: any) {
      toast({
        title: "❌ Erro",
        description: err.message || "Erro ao carregar questões",
        variant: "destructive",
      })
    } finally {
      setIsLoadingQuestoes(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#03565C]"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
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

  if (!candidato) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testes de Habilidades</h1>
          <p className="text-gray-600 mt-2">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (!candidato.area_atuacao) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testes de Habilidades</h1>
        </div>
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Você precisa definir sua área de atuação primeiro. Acesse seu perfil para completar essa informação.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/dashboard/candidato/meu-perfil")} className="bg-[#03565C] hover:bg-[#024147]">
          Completar Perfil
        </Button>
      </div>
    )
  }

  // ETAPA 1: Autoavaliação
  if (step === "autoavaliacao") {
    return (
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#03565C] to-[#24BFB0] text-white p-8 rounded-lg">
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
            <span className="text-sm text-gray-500">Etapa 1 de 2</span>
          </div>
          <Progress 
            value={(competenciasEscolhidas.size / Math.max(competenciasDisponiveis.length, 1)) * 100} 
            className="h-2" 
          />
        </div>

        {/* Grid de Competências (3 colunas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {competenciasDisponiveis.map((comp) => {
            const isSelected = competenciasEscolhidas.has(comp.nome)
            const competenciaData = competenciasEscolhidas.get(comp.nome)
            const nivel = competenciaData?.nivel || 3
            const descricao = competenciaData?.descricao || ""

            return (
              <Card
                key={comp.nome}
                className={`cursor-pointer transition-all overflow-hidden ${
                  isSelected
                    ? "border-2 border-[#03565C] bg-[#03565C]/5 shadow-md"
                    : "border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
                onClick={() => toggleCompetencia(comp.nome)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 flex-1">{comp.nome}</h3>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-[#03565C] flex-shrink-0 mt-1" />
                      )}
                    </div>

                    {!isSelected && (
                      <p className="text-xs text-gray-500 italic">
                        Clique para adicionar
                      </p>
                    )}

                    {isSelected && (
                      <div className="space-y-3 pt-3 border-t">
                        {/* Nível */}
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <Label className="text-xs font-medium">Nível</Label>
                            <span className="text-xs font-semibold text-[#03565C]">
                              {["", "Iniciante", "Básico", "Intermediário", "Avançado", "Expert"][nivel]}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  atualizarNivel(comp.nome, n)
                                }}
                                className={`flex-1 py-2 rounded font-semibold text-sm transition-all ${
                                  n === nivel
                                    ? "bg-[#03565C] text-white border-2 border-[#03565C]"
                                    : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Descrição (opcional) */}
                        <div>
                          <Label className="text-xs font-medium mb-1 block">Experiência (opcional)</Label>
                          <Textarea
                            placeholder="Ex: Projetos pessoais, trabalho..."
                            value={descricao}
                            onChange={(e) => {
                              e.stopPropagation()
                              atualizarDescricao(comp.nome, e.target.value)
                            }}
                            className="text-xs h-16 resize-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA */}
        <div className="flex gap-3 pt-6">
          <Button
            onClick={salvarAutoavaliacao}
            disabled={isSubmitting || competenciasEscolhidas.size === 0}
            className="gap-2 bg-[#03565C] hover:bg-[#024147] px-8"
          >
            {isSubmitting ? "Salvando..." : "Prosseguir para Testes"}
            {!isSubmitting && <ChevronRight className="h-4 w-4" />}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard/candidato")}
          >
            Cancelar
          </Button>
        </div>

        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            Selecione as competências relacionadas a <strong>{candidato.area_atuacao}</strong> e indique seu nível de conhecimento. A descrição é opcional e pode ajudar a contextualizar sua experiência.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // ETAPA 2: Testes (placeholder - será implementado com dados reais)
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#03565C] to-[#24BFB0] text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Testes Técnicos</h1>
        <p className="text-lg opacity-90">
          Responda aos testes das competências que você indicou
        </p>
      </div>

      {/* Competências selecionadas */}
      <Card className="border-[#24BFB0]">
        <CardHeader className="bg-[#03565C]/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Competências para testar</CardTitle>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setStep("autoavaliacao")}
              className="text-[#03565C] hover:text-[#024147] hover:bg-[#03565C]/10"
            >
              ✏️ Editar Competências
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {Array.from(competenciasEscolhidas.keys()).map((comp) => (
              <div key={comp} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center gap-2 flex-1">
                  <CheckCircle2 className="h-4 w-4 text-[#03565C] flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">{comp}</span>
                </div>
                <Button 
                  onClick={() => buscarQuestoes(comp)}
                  disabled={isLoadingQuestoes === comp}
                  size="sm"
                  className="bg-[#24BFB0] hover:bg-[#1a9d8b] text-gray-900 flex-shrink-0"
                >
                  {isLoadingQuestoes === comp ? "Carregando..." : "🎯 Fazer Teste"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!testeEmAndamento && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Clique em "🎯 Fazer Teste" em uma competência para começar o teste técnico. Você receberá 15 questões (5 de cada nível: Básico, Intermediário e Avançado).
          </AlertDescription>
        </Alert>
      )}

      {testeEmAndamento && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-900">Teste em Andamento: {testeEmAndamento.habilidade}</CardTitle>
            <CardDescription className="text-green-800">
              Total de questões: {testeEmAndamento.questoes.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testeEmAndamento.questoes.slice(0, 3).map((questao, idx) => (
                <div key={questao.id || idx} className="p-4 bg-white rounded border border-green-200">
                  <p className="font-semibold text-gray-900 mb-2">{idx + 1}. {questao.texto_questao || questao.pergunta}</p>
                  <div className="text-xs text-gray-600 mb-3">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Nível: {questao.nivel}</span>
                  </div>
                  {questao.alternativas && questao.alternativas.length > 0 && (
                    <div className="space-y-2">
                      {questao.alternativas.map((alt: any) => (
                        <button key={alt.id} className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-sm">
                          ○ {alt.texto}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {testeEmAndamento.questoes.length > 3 && (
                <p className="text-center text-gray-600 text-sm">
                  + {testeEmAndamento.questoes.length - 3} questões
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline"
                onClick={() => setTesteEmAndamento(null)}
              >
                Voltar
              </Button>
              <Button 
                className="bg-[#03565C] hover:bg-[#024147]"
                onClick={() => {
                  toast({
                    title: "ℹ️ Em Desenvolvimento",
                    description: "A funcionalidade completa de testes será implementada em breve",
                    variant: "default"
                  })
                }}
              >
                Continuar Teste
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button 
          onClick={() => router.push("/dashboard/candidato")}
          className="bg-[#03565C] hover:bg-[#024147]"
        >
          Concluir
        </Button>
      </div>
    </div>
  )
}
