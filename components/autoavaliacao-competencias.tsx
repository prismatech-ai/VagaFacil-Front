"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getAreaById, NIVEL_LABELS } from "@/lib/areas-competencias"

interface Competencia {
  id: string
  nome: string
  nivel: 1 | 2 | 3 | 4 | null
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
          nivel: null as (1 | 2 | 3 | 4 | null),
        })),
      }))
    : CATEGORIAS_COMPETENCIAS

  const [competencias, setCompetencias] = useState<CategoriaCompetencias[]>(
    categoriasInicial
  )

  const handleNivelChange = (categoriaId: string, competenciaId: string, nivel: 1 | 2 | 3 | 4) => {
    setCompetencias(
      competencias.map((cat) =>
        cat.id === categoriaId
          ? {
              ...cat,
              competencias: cat.competencias.map((comp) =>
                comp.id === competenciaId ? { ...comp, nivel } : comp
              ),
            }
          : cat
      )
    )
  }

  const toggleCompetencia = (categoriaId: string, competenciaId: string) => {
    const currentNivel = competencias
      .find((c) => c.id === categoriaId)
      ?.competencias.find((comp) => comp.id === competenciaId)?.nivel

    if (currentNivel) {
      // Se já tem nível, remove a competência
      setCompetencias(
        competencias.map((cat) =>
          cat.id === categoriaId
            ? {
                ...cat,
                competencias: cat.competencias.map((comp) =>
                  comp.id === competenciaId ? { ...comp, nivel: null } : comp
                ),
              }
            : cat
        )
      )
    } else {
      // Se não tem nível, adiciona nível 1
      handleNivelChange(categoriaId, competenciaId, 1)
    }
  }

  const competenciasDeclaradas = competencias.flatMap((cat) =>
    cat.competencias.filter((comp) => comp.nivel !== null)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(competenciasDeclaradas)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-secondary/30 py-8">
      <Card className="w-full max-w-3xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#03565C] to-[#24BFB0] text-white">
          <CardTitle className="text-2xl text-white">Autoavaliação de Competências</CardTitle>
          <CardDescription className="text-white/90">
            Etapa 2 de 3 - Selecione seu nível em cada competência (15 minutos)
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Progress Indicator */}
          <div className="mb-8 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                Etapa 2 de 3 - {competenciasDeclaradas.length} competência(s) selecionada(s)
              </span>
              <span className="text-gray-500">Autoavaliação</span>
            </div>
            <Progress value={66} className="h-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Categorias */}
            {competencias.map((categoria) => (
              <div key={categoria.id} className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900">{categoria.nome}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoria.competencias.map((competencia) => (
                    <div
                      key={competencia.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        competencia.nivel
                          ? "border-[#24BFB0] bg-[#25D9B8]/10"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="mb-3">
                        <button
                          type="button"
                          onClick={() => toggleCompetencia(categoria.id, competencia.id)}
                          disabled={isLoading}
                          className={`font-semibold text-left w-full ${
                            competencia.nivel ? "text-[#03565C]" : "text-gray-900"
                          } hover:opacity-75 transition-opacity`}
                        >
                          {competencia.nome}
                        </button>
                      </div>

                      {competencia.nivel && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-[#03565C]">
                              Nível {competencia.nivel} - {NIVEL_LABELS[competencia.nivel]}
                            </Badge>
                          </div>

                          <div className="flex gap-2">
                            {[1, 2, 3, 4].map((nivel) => (
                              <button
                                key={nivel}
                                type="button"
                                onClick={() =>
                                  handleNivelChange(categoria.id, competencia.id, nivel as 1 | 2 | 3 | 4)
                                }
                                disabled={isLoading}
                                className={`flex-1 py-2 rounded text-xs font-semibold transition-all ${
                                  competencia.nivel === nivel
                                    ? "bg-[#03565C] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {nivel}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {!competencia.nivel && (
                        <p className="text-xs text-gray-500 italic">
                          Clique no título para adicionar nível
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Info */}
            <Alert className="border-[#24BFB0]/30 bg-[#25D9B8]/10">
              <AlertCircle className="h-4 w-4 text-[#03565C]" />
              <AlertDescription className="text-[#03565C] text-sm">
                Selecione apenas as competências que você realmente domina. Você receberá testes técnicos
                para validar cada uma delas.
              </AlertDescription>
            </Alert>

            {/* CTA */}
            <Button
              type="submit"
              disabled={competenciasDeclaradas.length === 0 || isLoading}
              className="w-full gap-2 bg-[#03565C] hover:bg-[#024147] py-6 text-base"
            >
              {isLoading ? "Salvando..." : `Continuar com ${competenciasDeclaradas.length} competência(s)`}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
