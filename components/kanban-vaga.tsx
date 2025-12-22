"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, BarChart3, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CandidatoKanban {
  id: string
  candidatoId: string // UUID anônimo
  competenciasDeclaradas: string[]
  testes: { competencia: string; score: number }[]
  demonstrouInteresse: boolean
  aceituEntrevista: boolean
  dataDemonstrouInteresse?: string
}

interface KanbanVagaProps {
  vagaId: string
  vagaTitulo: string
  areaVaga: string
  candidatos?: CandidatoKanban[]
  onViewCandidato: (candidatoId: string) => void
  isLoading?: boolean
}

// Mock de candidatos no kanban
const MOCK_CANDIDATOS: CandidatoKanban[] = [
  {
    id: "kanban-1",
    candidatoId: "cand-uuid-001",
    competenciasDeclaradas: ["React", "TypeScript"],
    testes: [
      { competencia: "React", score: 8 },
    ],
    demonstrouInteresse: false,
    aceituEntrevista: false,
  },
  {
    id: "kanban-2",
    candidatoId: "cand-uuid-002",
    competenciasDeclaradas: ["React", "TypeScript", "JavaScript"],
    testes: [
      { competencia: "React", score: 9 },
      { competencia: "TypeScript", score: 8 },
    ],
    demonstrouInteresse: false,
    aceituEntrevista: false,
  },
  {
    id: "kanban-3",
    candidatoId: "cand-uuid-003",
    competenciasDeclaradas: ["React", "TypeScript"],
    testes: [
      { competencia: "React", score: 7 },
      { competencia: "TypeScript", score: 8 },
    ],
    demonstrouInteresse: true,
    aceituEntrevista: false,
    dataDemonstrouInteresse: "2024-01-10",
  },
  {
    id: "kanban-4",
    candidatoId: "cand-uuid-004",
    competenciasDeclaradas: ["React", "TypeScript"],
    testes: [
      { competencia: "React", score: 9 },
      { competencia: "TypeScript", score: 9 },
    ],
    demonstrouInteresse: true,
    aceituEntrevista: true,
  },
]

const COLUNAS = [
  { id: "comp-assessment", titulo: "Autoavaliação de Competências", cor: "bg-blue-50" },
  { id: "testes-done", titulo: "Testes Concluídos", cor: "bg-green-50" },
  { id: "testes-pending", titulo: "Testes Pendentes", cor: "bg-yellow-50" },
  { id: "company-interest", titulo: "Interesse da Empresa", cor: "bg-purple-50" },
  { id: "interview-accepted", titulo: "Entrevista Aceita", cor: "bg-emerald-50" },
]

export function KanbanVaga({
  vagaId,
  vagaTitulo = "Senior React Developer",
  areaVaga = "Frontend",
  candidatos = MOCK_CANDIDATOS,
  onViewCandidato,
  isLoading = false,
}: KanbanVagaProps) {
  const [filtroCompetencia, setFiltroCompetencia] = useState("")
  const [showLegenda, setShowLegenda] = useState(false)

  // Filtra candidatos por competência se aplicável
  const candidatosFiltrados = filtroCompetencia
    ? candidatos.filter((c) => c.competenciasDeclaradas.includes(filtroCompetencia))
    : candidatos

  // Agrupa candidatos por coluna
  const candidatosParaColuna = (colunaId: string) => {
    return candidatosFiltrados.filter((c) => {
      switch (colunaId) {
        case "comp-assessment":
          return true // Todos têm autoavaliação
        case "testes-done":
          return c.testes.length > 0
        case "testes-pending":
          return c.testes.length === 0
        case "company-interest":
          return c.demonstrouInteresse
        case "interview-accepted":
          return c.aceituEntrevista
        default:
          return false
      }
    })
  }

  // Competências únicas para filtro
  const competenciasUnicas = Array.from(
    new Set(candidatos.flatMap((c) => c.competenciasDeclaradas))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{vagaTitulo}</h1>
              <p className="text-gray-600 mt-1">Kanban de Candidatos</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{candidatosFiltrados.length}</p>
              <p className="text-sm text-gray-600">candidatos alinhados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controles */}
        <div className="flex gap-4 mb-8 flex-wrap items-center">
          <Select value={filtroCompetencia || "todas"} onValueChange={(valor) => setFiltroCompetencia(valor === "todas" ? "" : valor)}>
            <SelectTrigger className="w-80">
              <SelectValue placeholder="Filtrar por competência..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as competências</SelectItem>
              {competenciasUnicas.map((comp) => (
                <SelectItem key={comp} value={comp}>
                  {comp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => setShowLegenda(!showLegenda)}
            variant="outline"
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {showLegenda ? "Ocultar" : "Mostrar"} Legenda
          </Button>

          <div className="ml-auto text-sm text-gray-600">
            Mostrando {candidatosFiltrados.length} de {candidatos.length} candidatos
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50 mb-8">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>IDs Anônimos:</strong> Os candidatos só aparecem com seus UUIDs até que você
            demonstre interesse. Após demonstrar interesse, você poderá ver competências e testes.
            Dados pessoais só são liberados após aceitar entrevista.
          </AlertDescription>
        </Alert>

        {/* Legenda */}
        {showLegenda && (
          <Card className="mb-8 bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {COLUNAS.map((col) => (
                  <div key={col.id}>
                    <div className={`${col.cor} p-3 rounded border-l-4 border-gray-400`}>
                      <p className="text-xs font-bold text-gray-900">{col.titulo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {COLUNAS.map((coluna) => {
            const candidatosColuna = candidatosParaColuna(coluna.id)
            return (
              <div key={coluna.id} className={`${coluna.cor} rounded-lg p-4 min-h-96`}>
                <div className="mb-4 sticky top-0">
                  <h3 className="font-bold text-gray-900 mb-1">{coluna.titulo}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {candidatosColuna.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {candidatosColuna.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-xs">Nenhum candidato</p>
                    </div>
                  ) : (
                    candidatosColuna.map((candidato) => (
                      <Card
                        key={candidato.id}
                        className="p-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-400"
                        onClick={() => onViewCandidato(candidato.candidatoId)}
                      >
                        <p className="font-mono text-xs text-gray-600 mb-2">
                          {candidato.candidatoId}
                        </p>

                        <div className="space-y-2 text-xs">
                          <div>
                            <p className="text-gray-600 font-semibold">Competências:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {candidato.competenciasDeclaradas.map((comp) => (
                                <Badge
                                  key={comp}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {comp}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {candidato.testes.length > 0 && (
                            <div>
                              <p className="text-gray-600 font-semibold">Testes:</p>
                              <div className="space-y-1 mt-1">
                                {candidato.testes.map((teste) => (
                                  <div key={teste.competencia} className="flex justify-between">
                                    <span>{teste.competencia}:</span>
                                    <span className="font-bold text-green-700">
                                      {teste.score}/10
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {candidato.demonstrouInteresse && (
                            <div className="pt-2 border-t border-gray-300">
                              <Badge className="bg-purple-600 text-white text-xs">
                                Interesse da Empresa
                              </Badge>
                              {candidato.dataDemonstrouInteresse && (
                                <p className="text-gray-600 mt-1">
                                  {new Date(candidato.dataDemonstrouInteresse).toLocaleDateString(
                                    "pt-BR"
                                  )}
                                </p>
                              )}
                            </div>
                          )}

                          {candidato.aceituEntrevista && (
                            <div className="pt-2 border-t border-gray-300">
                              <Badge className="bg-green-600 text-white text-xs">
                                Entrevista Aceita
                              </Badge>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <Card className="mt-8 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Resumo do Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {COLUNAS.map((col) => (
                <div key={col.id} className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {candidatosParaColuna(col.id).length}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{col.titulo}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
