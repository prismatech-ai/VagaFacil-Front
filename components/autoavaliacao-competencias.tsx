"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getAreaById, NIVEL_LABELS } from "@/lib/areas-competencias"
import { api } from "@/lib/api"

interface Competencia {
  id: string
  nome: string
  nivel: number | null
}

interface CategoriaCompetencias {
  id: string
  nome: string
  competencias: Competencia[]
}

interface AutoavaliacaoCompetenciasProps {
  areaId?: string
  onComplete: (competencias: Competencia[]) => void
  isLoading?: boolean
  showHeader?: boolean
}

// Mock competências por categoria
const CATEGORIAS_COMPETENCIAS: CategoriaCompetencias[] = [
  {
    id: "linguagens",
    nome: "Linguagens de Programação",
    competencias: [
      { id: "js", nome: "JavaScript/TypeScript", nivel: null },
      { id: "python", nome: "Python", nivel: null },
      { id: "java", nome: "Java", nivel: null },
      { id: "csharp", nome: "C#", nivel: null },
    ],
  },
  {
    id: "frameworks",
    nome: "Frameworks & Libraries",
    competencias: [
      { id: "react", nome: "React", nivel: null },
      { id: "vue", nome: "Vue.js", nivel: null },
      { id: "angular", nome: "Angular", nivel: null },
      { id: "nodejs", nome: "Node.js", nivel: null },
    ],
  },
  {
    id: "ferramentas",
    nome: "Ferramentas & DevOps",
    competencias: [
      { id: "git", nome: "Git", nivel: null },
      { id: "docker", nome: "Docker", nivel: null },
      { id: "kubernetes", nome: "Kubernetes", nivel: null },
      { id: "ci-cd", nome: "CI/CD", nivel: null },
    ],
  },
]

export function AutoavaliacaoCompetencias({
  areaId,
  onComplete,
  isLoading = false,
  showHeader = true,
}: AutoavaliacaoCompetenciasProps) {
  // Obter competências da área selecionada ou usar defaults
  const area = areaId ? getAreaById(areaId) : null
  const categoriasInicial: CategoriaCompetencias[] = area
    ? area.categorias.map((cat) => ({
        id: cat.id,
        nome: cat.nome,
        competencias: cat.competencias.map((comp) => ({
          id: comp.id,
          nome: comp.nome,
          nivel: null,
        })),
      }))
    : CATEGORIAS_COMPETENCIAS

  const [competencias, setCompetencias] = useState<CategoriaCompetencias[]>(
    categoriasInicial
  )
  const [submitting, setSubmitting] = useState(false)
  const [expandedCompetencia, setExpandedCompetencia] = useState<string | null>(null)

  const handleNivelChange = (categoriaId: string, competenciaId: string, nivel: number) => {
    setCompetencias(
      competencias.map((cat) =>
        cat.id === categoriaId
          ? {
              ...cat,
              competencias: cat.competencias.map((comp) =>
                comp.id === competenciaId ? { ...comp, nivel: nivel === 0 ? null : nivel } : comp
              ),
            }
          : cat
      )
    )
  }

  // Usar dados locais (mock data)
  // Se areaId mudar no futuro, implementar API call

  const competenciasDeclaradas = competencias.flatMap((cat) =>
    cat.competencias.filter((comp) => comp.nivel !== null)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Enviar autoavaliação para API: POST /api/v1/candidates/onboarding/dados-profissionais
      const payload = {
        competencias: competenciasDeclaradas.map((comp) => ({
          competencia_id: comp.id,
          nivel_declarado: String(comp.nivel)
        }))
      }
      
      try {
        // Endpoint da API corrigido - user_id será adicionado automaticamente pela função api
        await api.post("/api/v1/candidates/onboarding/dados-profissionais", payload)
      } catch (error: any) {

        // Fallback: continuar com dados locais se o endpoint não estiver disponível
      }
      
      onComplete(competenciasDeclaradas)
    } catch (error) {

    } finally {
      setSubmitting(false)
    }
  }

  const totalCompetencias = competencias.reduce((acc, cat) => acc + cat.competencias.length, 0)

  return (
    <>
      {showHeader ? (
        <div className="min-h-screen flex items-center justify-center px-4 bg-secondary/30 py-8">
          <Card className="w-full max-w-2xl shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#03565C] to-[#24BFB0] text-white">
              <CardTitle className="text-2xl text-white">Avalie suas competências</CardTitle>
              <CardDescription className="text-white/90">
                Indique seu nível de proficiência em cada habilidade (escala de 1 a 5)
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Progress Indicator */}
              <div className="mb-8 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Etapa 2 de 3</span>
                  <span className="text-gray-500">Autoavaliação de Competências</span>
                </div>
                <Progress value={66} className="h-2" />
              </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Categorias */}
            {competencias.map((categoria) => (
              <div key={categoria.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-gray-900">{categoria.nome}</h3>
                  <span className="text-sm bg-[#03565C] text-white px-3 py-1 rounded-full">
                    {categoria.competencias.filter(c => c.nivel !== null).length}/{categoria.competencias.length}
                  </span>
                </div>

                {/* Grid de Competências */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoria.competencias.map((competencia) => (
                    <button
                      key={competencia.id}
                      type="button"
                      onClick={() =>
                        setExpandedCompetencia(
                          expandedCompetencia === competencia.id ? null : competencia.id
                        )
                      }
                      disabled={isLoading}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        expandedCompetencia === competencia.id
                          ? "border-[#24BFB0] bg-[#25D9B8]/10"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className={`font-semibold text-sm transition-colors ${
                          expandedCompetencia === competencia.id
                            ? "text-[#03565C]"
                            : "text-gray-900"
                        }`}>
                          {competencia.nome}
                        </h4>
                        {competencia.nivel !== null && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                            {competencia.nivel}/5
                          </span>
                        )}
                      </div>

                      {/* Slider expandido */}
                      {expandedCompetencia === competencia.id && (
                        <div className="space-y-4 pt-3 border-t border-gray-200">
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((nivel) => (
                              <button
                                key={nivel}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleNivelChange(categoria.id, competencia.id, nivel)
                                }}
                                disabled={isLoading}
                                className={`flex-1 py-3 rounded font-semibold transition-all text-sm ${
                                  competencia.nivel === nivel
                                    ? "bg-[#03565C] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200"
                                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {nivel}
                              </button>
                            ))}
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 px-0 mt-4 gap-1">
                            <span className="flex-1 text-left">Nenhuma</span>
                            <span className="flex-1 text-center">Intermediário</span>
                            <span className="flex-1 text-right">Avançado</span>
                          </div>
                          {competencia.nivel !== null && (
                            <div className="text-center">
                              <span className="text-sm font-semibold text-[#03565C]">
                                Nível: {competencia.nivel}/5
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {expandedCompetencia !== competencia.id && competencia.nivel === null && (
                        <p className="text-xs text-gray-500 italic">Clique para avaliar</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Info */}
            <Alert className="border-[#24BFB0]/30 bg-[#25D9B8]/10">
              <AlertCircle className="h-4 w-4 text-[#03565C]" />
              <AlertDescription className="text-[#03565C] text-sm">
                Avalie seu nível atual de conhecimento em cada competência. Você receberá testes técnicos para validar suas habilidades.
              </AlertDescription>
            </Alert>

            {/* CTA */}
            <Button
              type="submit"
              disabled={competenciasDeclaradas.length === 0 || isLoading || submitting}
              className="w-full gap-2 bg-[#03565C] hover:bg-[#024147] py-6 text-base"
            >
              {submitting ? "Salvando..." : isLoading ? "Carregando..." : `Continuar com ${competenciasDeclaradas.length} competência(s) avaliada(s)`}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Versão Compacta sem Header */}
          {competencias.map((categoria) => (
            <div key={categoria.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">{categoria.nome}</h3>
                <span className="text-sm bg-[#03565C] text-white px-3 py-1 rounded-full">
                  {categoria.competencias.filter(c => c.nivel !== null).length}/{categoria.competencias.length}
                </span>
              </div>

              {/* Grid de Competências */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoria.competencias.map((competencia) => (
                  <button
                    key={competencia.id}
                    type="button"
                    onClick={() =>
                      setExpandedCompetencia(
                        expandedCompetencia === competencia.id ? null : competencia.id
                      )
                    }
                    disabled={isLoading}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      expandedCompetencia === competencia.id
                        ? "border-[#24BFB0] bg-[#25D9B8]/10"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className={`font-semibold text-sm transition-colors ${
                        expandedCompetencia === competencia.id
                          ? "text-[#03565C]"
                          : "text-gray-900"
                      }`}>
                        {competencia.nome}
                      </h4>
                      {competencia.nivel !== null && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                          {competencia.nivel}/5
                        </span>
                      )}
                    </div>

                    {/* Botões expandidos */}
                    {expandedCompetencia === competencia.id && (
                      <div className="space-y-4 pt-3 border-t border-gray-200">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((nivel) => (
                            <button
                              key={nivel}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                handleNivelChange(categoria.id, competencia.id, nivel)
                              }}
                              disabled={isLoading}
                              className={`flex-1 py-3 rounded font-semibold transition-all text-sm ${
                                competencia.nivel === nivel
                                  ? "bg-[#03565C] text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200"
                              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {nivel}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 px-0 mt-4 gap-1">
                          <span className="flex-1 text-left">Nenhuma</span>
                          <span className="flex-1 text-center">Intermediário</span>
                          <span className="flex-1 text-right">Avançado</span>
                        </div>
                        {competencia.nivel !== null && (
                          <div className="text-center">
                            <span className="text-sm font-semibold text-[#03565C]">
                              Nível: {competencia.nivel}/5
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {expandedCompetencia !== competencia.id && competencia.nivel === null && (
                      <p className="text-xs text-gray-500 italic">Clique para avaliar</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* CTA - Compacta */}
          {competenciasDeclaradas.length > 0 && (
            <Button
              type="submit"
              disabled={competenciasDeclaradas.length === 0 || isLoading || submitting}
              className="w-full gap-2 bg-[#03565C] hover:bg-[#024147]"
            >
              {submitting ? "Salvando..." : "Confirmar"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </form>
      )}
    </>
  )
}
