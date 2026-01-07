"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, BarChart3, Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CandidatoKanban {
  id: string
  candidatoId: string // UUID anônimo
  competenciasDeclaradas: string[]
  testes: { competencia: string; score: number }[]
  demonstrouInteresse: boolean
  aceituEntrevista: boolean
  dataDemonstrouInteresse?: string
  estado?: string
  cidade?: string
  genero?: string
  area_atuacao?: string
  is_pcd?: boolean
  coluna?: string
}

interface KanbanVagaProps {
  vagaId: string
  vagaTitulo: string
  areaVaga: string
  candidatos?: CandidatoKanban[]
  onViewCandidato: (candidatoId: string) => void
  isLoading?: boolean
  onMoverCandidato?: (candidatoId: string, novaColuna: string) => void
}

const COLUNAS = [
  { id: "todos-candidatos", titulo: "Todos os Candidatos", cor: "bg-[#25D9B8]/10" },
  { id: "selecionado-entrevista", titulo: "Selecionado para Entrevista", cor: "bg-blue-50" },
  { id: "interview-accepted", titulo: "Entrevista Aceita", cor: "bg-emerald-50" },
  { id: "entrevista-aprovado", titulo: "Aprovados na Entrevista", cor: "bg-green-100" },
  { id: "contratados", titulo: "Contratados", cor: "bg-green-50" },
]

export function KanbanVaga({
  vagaId,
  vagaTitulo = "Senior React Developer",
  areaVaga = "Frontend",
  candidatos = [],
  onViewCandidato,
  isLoading = false,
  onMoverCandidato,
}: KanbanVagaProps) {
  const [filtroCompetencia, setFiltroCompetencia] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [filtroCidade, setFiltroCidade] = useState("")
  const [filtroGenero, setFiltroGenero] = useState("")
  const [filtroArea, setFiltroArea] = useState("")
  const [filtroPCD, setFiltroPCD] = useState("")
  const [showLegenda, setShowLegenda] = useState(false)
  const [draggedCandidato, setDraggedCandidato] = useState<string | null>(null)
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<CandidatoKanban | null>(null)
  const [showModalDetalhes, setShowModalDetalhes] = useState(false)
  const [candidatosComColuna, setCandidatosComColuna] = useState<CandidatoKanban[]>(
    candidatos.map((c) => ({ ...c, coluna: c.coluna || "todos-candidatos" }))
  )

  // Extrai valores únicos para filtros
  const estadosUnicos = Array.from(
    new Set(candidatos.map((c: any) => c.estado).filter(Boolean))
  ).sort()
  
  const cidadesUnicas = filtroEstado
    ? Array.from(
        new Set(
          candidatos
            .filter((c: any) => c.estado === filtroEstado)
            .map((c: any) => c.cidade)
            .filter(Boolean)
        )
      ).sort()
    : []

  const generosUnicos = Array.from(
    new Set(candidatos.map((c: any) => c.genero).filter(Boolean))
  ).sort()

  const areasUnicas = Array.from(
    new Set(candidatos.map((c: any) => c.area_atuacao).filter(Boolean))
  ).sort()

  const competenciasUnicas = Array.from(
    new Set(candidatos.flatMap((c) => c.competenciasDeclaradas))
  )

  // Filtra candidatos por todos os critérios
  const candidatosFiltrados = candidatosComColuna.filter((c: any) => {
    const passaFiltroCompetencia = !filtroCompetencia || c.competenciasDeclaradas.includes(filtroCompetencia)
    const passaFiltroEstado = !filtroEstado || c.estado === filtroEstado
    const passaFiltroCidade = !filtroCidade || c.cidade === filtroCidade
    const passaFiltroGenero = !filtroGenero || c.genero === filtroGenero
    const passaFiltroArea = !filtroArea || c.area_atuacao === filtroArea
    const passaFiltroPCD = !filtroPCD || (filtroPCD === "sim" ? c.is_pcd : !c.is_pcd)

    return (
      passaFiltroCompetencia &&
      passaFiltroEstado &&
      passaFiltroCidade &&
      passaFiltroGenero &&
      passaFiltroArea &&
      passaFiltroPCD
    )
  })

  // Agrupa candidatos por coluna
  const candidatosParaColuna = (colunaId: string) => {
    return candidatosFiltrados.filter((c) => (c.coluna || "todos-candidatos") === colunaId)
  }

  // Handlers para drag and drop
  const handleDragStart = (e: React.DragEvent, candidatoId: string) => {
    setDraggedCandidato(candidatoId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, novaColuna: string) => {
    e.preventDefault()
    if (draggedCandidato) {
      setCandidatosComColuna((prev) =>
        prev.map((c) =>
          c.id === draggedCandidato ? { ...c, coluna: novaColuna } : c
        )
      )
      if (onMoverCandidato) {
        onMoverCandidato(draggedCandidato, novaColuna)
      }
      setDraggedCandidato(null)
    }
  }

  const handleAbrirDetalhes = (candidato: CandidatoKanban) => {
    setCandidatoSelecionado(candidato)
    setShowModalDetalhes(true)
    onViewCandidato(candidato.candidatoId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{vagaTitulo}</h1>
              <p className="text-gray-600 mt-1">Status de Candidatos</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#03565C]">{candidatosFiltrados.length}</p>
              <p className="text-sm text-gray-600">candidatos alinhados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controles de Filtro */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filtros</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Filtro Competência */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Competência</label>
              <Select value={filtroCompetencia || "todas"} onValueChange={(valor) => setFiltroCompetencia(valor === "todas" ? "" : valor)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as competências" />
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
            </div>

            {/* Filtro Estado */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Estado</label>
              <Select value={filtroEstado || "todos"} onValueChange={(valor) => {
                setFiltroEstado(valor === "todos" ? "" : valor)
                setFiltroCidade("")
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os estados</SelectItem>
                  {estadosUnicos.map((estado) => (
                    <SelectItem key={estado} value={estado as string}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Cidade */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Cidade</label>
              <Select value={filtroCidade || "todas"} onValueChange={(valor) => setFiltroCidade(valor === "todas" ? "" : valor)} disabled={!filtroEstado}>
                <SelectTrigger className={!filtroEstado ? "opacity-50 cursor-not-allowed" : ""}>
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as cidades</SelectItem>
                  {cidadesUnicas.map((cidade) => (
                    <SelectItem key={cidade} value={cidade as string}>
                      {cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Gênero */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Gênero</label>
              <Select value={filtroGenero || "todos"} onValueChange={(valor) => setFiltroGenero(valor === "todos" ? "" : valor)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os gêneros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os gêneros</SelectItem>
                  {generosUnicos.map((genero) => (
                    <SelectItem key={genero} value={genero as string}>
                      {genero}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Área de Atuação */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Área de Atuação</label>
              <Select value={filtroArea || "todas"} onValueChange={(valor) => setFiltroArea(valor === "todas" ? "" : valor)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as áreas</SelectItem>
                  {areasUnicas.map((area) => (
                    <SelectItem key={area} value={area as string}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro PCD */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Pessoa com Deficiência</label>
              <Select value={filtroPCD || "todos"} onValueChange={(valor) => setFiltroPCD(valor === "todos" ? "" : valor)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 items-center flex-wrap">
            <Button
              onClick={() => {
                setFiltroCompetencia("")
                setFiltroEstado("")
                setFiltroCidade("")
                setFiltroGenero("")
                setFiltroArea("")
                setFiltroPCD("")
              }}
              variant="outline"
              className="text-sm"
            >
              Limpar Filtros
            </Button>

            <Button
              onClick={() => setShowLegenda(!showLegenda)}
              variant="outline"
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {showLegenda ? "Ocultar" : "Mostrar"} Legenda
            </Button>

            <div className="ml-auto text-sm text-gray-600">
              Mostrando <strong>{candidatosFiltrados.length}</strong> de <strong>{candidatos.length}</strong> candidatos
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="border-[#24BFB0]/30 bg-[#25D9B8]/10 mb-8">
          <AlertCircle className="h-4 w-4 text-[#03565C]" />
          <AlertDescription className="text-[#03565C]">
            <strong>Drag & Drop:</strong> Arraste os candidatos entre as colunas para mover sua posição no pipeline.
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {COLUNAS.map((coluna) => {
            const candidatosColuna = candidatosParaColuna(coluna.id)
            return (
              <div 
                key={coluna.id} 
                className={`${coluna.cor} rounded-lg p-4 min-h-96 flex flex-col`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, coluna.id)}
              >
                <div className="mb-4 sticky top-0">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{coluna.titulo}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {candidatosColuna.length}
                  </Badge>
                </div>

                <div className="space-y-3 flex-1">
                  {candidatosColuna.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-xs">Nenhum candidato</p>
                    </div>
                  ) : (
                    candidatosColuna.map((candidato) => (
                      <Card
                        key={candidato.id}
                        className={`p-3 cursor-move hover:shadow-md transition-shadow border border-gray-200 hover:border-[#24BFB0] ${
                          draggedCandidato === candidato.id ? "opacity-50" : ""
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidato.id)}
                        onClick={() => handleAbrirDetalhes(candidato)}
                      >
                        <p className="font-mono text-xs text-gray-600 mb-2">
                          {candidato.candidatoId.slice(0, 12)}...
                        </p>

                        <div className="space-y-2 text-xs">
                          <div>
                            <p className="text-gray-600 font-semibold">Competências:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {candidato.competenciasDeclaradas.slice(0, 2).map((comp) => (
                                <Badge
                                  key={comp}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {comp}
                                </Badge>
                              ))}
                              {candidato.competenciasDeclaradas.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{candidato.competenciasDeclaradas.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {candidato.testes.length > 0 && (
                            <div>
                              <p className="text-gray-600 font-semibold">Score:</p>
                              <div className="space-y-1 mt-1">
                                {candidato.testes.map((teste) => (
                                  <div key={teste.competencia} className="flex justify-between">
                                    <span className="text-gray-600">{teste.competencia}:</span>
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
                              <Badge className="bg-[#03565C] text-white text-xs">
                                Interesse
                              </Badge>
                            </div>
                          )}

                          {candidato.aceituEntrevista && (
                            <div className="pt-2 border-t border-gray-300">
                              <Badge className="bg-green-600 text-white text-xs">
                                Entrevista OK
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
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
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

      {/* Modal de Detalhes */}
      <Dialog open={showModalDetalhes} onOpenChange={setShowModalDetalhes}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle>Detalhes do Candidato</DialogTitle>
              <button onClick={() => setShowModalDetalhes(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          {candidatoSelecionado && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Informações Básicas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">ID Anônimo</p>
                    <p className="font-mono text-sm text-gray-900">{candidatoSelecionado.candidatoId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Gênero</p>
                    <p className="text-sm text-gray-900">{candidatoSelecionado.genero || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Estado</p>
                    <p className="text-sm text-gray-900">{candidatoSelecionado.estado || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Cidade</p>
                    <p className="text-sm text-gray-900">{candidatoSelecionado.cidade || "Não informado"}</p>
                  </div>
                </div>
              </div>

              {/* Competências */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Competências Declaradas</h3>
                <div className="flex flex-wrap gap-2">
                  {candidatoSelecionado.competenciasDeclaradas.length > 0 ? (
                    candidatoSelecionado.competenciasDeclaradas.map((comp) => (
                      <Badge key={comp} className="bg-[#03565C] text-white">
                        {comp}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">Nenhuma competência declarada</p>
                  )}
                </div>
              </div>

              {/* Testes */}
              {candidatoSelecionado.testes.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Resultados de Testes</h3>
                  <div className="space-y-2">
                    {candidatoSelecionado.testes.map((teste) => (
                      <div key={teste.competencia} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-900">{teste.competencia}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                            <div 
                              className="h-full bg-green-600 rounded"
                              style={{ width: `${(teste.score / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-900">{teste.score.toFixed(1)}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {candidatoSelecionado.is_pcd && (
                    <Badge className="bg-blue-600 text-white">Pessoa com Deficiência</Badge>
                  )}
                  {candidatoSelecionado.demonstrouInteresse && (
                    <Badge className="bg-[#03565C] text-white">Interesse da Empresa</Badge>
                  )}
                  {candidatoSelecionado.aceituEntrevista && (
                    <Badge className="bg-green-600 text-white">Entrevista Aceita</Badge>
                  )}
                </div>
              </div>

              {/* Coluna Atual */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Posição no Pipeline</h3>
                <p className="text-sm text-gray-900">
                  {COLUNAS.find((c) => c.id === (candidatoSelecionado.coluna || "comp-assessment"))?.titulo}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
