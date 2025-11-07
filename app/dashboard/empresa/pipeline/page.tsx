"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Eye, ArrowRight, ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react"
import { mockCandidaturas, mockUsers, mockVagas } from "@/lib/mock-data"
import type { Candidatura, Candidato, Vaga } from "@/lib/types"

type StatusCandidatura = "pendente" | "em_analise" | "entrevista" | "finalista" | "aprovado" | "rejeitado"

const colunas: { id: StatusCandidatura; titulo: string; cor: string }[] = [
  { id: "pendente", titulo: "Pendente", cor: "bg-gray-100" },
  { id: "em_analise", titulo: "Em Análise", cor: "bg-blue-100" },
  { id: "entrevista", titulo: "Entrevista", cor: "bg-yellow-100" },
  { id: "finalista", titulo: "Finalista", cor: "bg-purple-100" },
  { id: "aprovado", titulo: "Aprovado", cor: "bg-green-100" },
  { id: "rejeitado", titulo: "Recusado", cor: "bg-red-100" },
]

export default function PipelinePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [candidaturas, setCandidaturas] = useState(mockCandidaturas)
  const [candidaturaSelecionada, setCandidaturaSelecionada] = useState<Candidatura | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [vagaFiltro, setVagaFiltro] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role !== "empresa") {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== "empresa") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const minhasVagas = mockVagas.filter((v) => v.empresaId === user.id)
  const minhasCandidaturas = candidaturas.filter((c) => {
    const vaga = mockVagas.find((v) => v.id === c.vagaId)
    return vaga?.empresaId === user.id
  })

  const candidaturasFiltradas = vagaFiltro
    ? minhasCandidaturas.filter((c) => c.vagaId === vagaFiltro)
    : minhasCandidaturas

  const moverCandidatura = (candidaturaId: string, novoStatus: StatusCandidatura) => {
    setCandidaturas(
      candidaturas.map((c) => (c.id === candidaturaId ? { ...c, status: novoStatus } : c)),
    )
  }

  const getCandidaturasPorColuna = (status: StatusCandidatura) => {
    return candidaturasFiltradas.filter((c) => c.status === status)
  }

  const getStatusIcon = (status: StatusCandidatura) => {
    switch (status) {
      case "pendente":
        return <Clock className="h-4 w-4" />
      case "em_analise":
        return <Eye className="h-4 w-4" />
      case "entrevista":
        return <Users className="h-4 w-4" />
      case "finalista":
        return <CheckCircle2 className="h-4 w-4" />
      case "aprovado":
        return <CheckCircle2 className="h-4 w-4" />
      case "rejeitado":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: StatusCandidatura) => {
    const variants: Record<StatusCandidatura, "default" | "secondary" | "destructive" | "outline"> = {
      pendente: "outline",
      em_analise: "secondary",
      entrevista: "default",
      finalista: "default",
      aprovado: "default",
      rejeitado: "destructive",
    }
    return variants[status] || "outline"
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <DashboardHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Pipeline de Candidatos</h2>
          <p className="text-muted-foreground">Gerencie o fluxo de candidaturas por etapas</p>
        </div>

        {/* Filtro por Vaga */}
        {minhasVagas.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Filtrar por vaga:</label>
                <select
                  value={vagaFiltro || ""}
                  onChange={(e) => setVagaFiltro(e.target.value || null)}
                  className="flex-1 max-w-xs px-3 py-2 border rounded-md"
                >
                  <option value="">Todas as vagas</option>
                  {minhasVagas.map((vaga) => (
                    <option key={vaga.id} value={vaga.id}>
                      {vaga.titulo}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {colunas.map((coluna) => {
            const candidaturasColuna = getCandidaturasPorColuna(coluna.id)
            return (
              <Card key={coluna.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-sm font-semibold">{coluna.titulo}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {candidaturasColuna.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getStatusIcon(coluna.id)}
                    <span>{candidaturasColuna.length} candidato(s)</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 overflow-y-auto max-h-[600px]">
                  {candidaturasColuna.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      Nenhum candidato nesta etapa
                    </div>
                  ) : (
                    candidaturasColuna.map((candidatura) => {
                      const candidato = mockUsers.find((u) => u.id === candidatura.candidatoId) as Candidato
                      const vaga = mockVagas.find((v) => v.id === candidatura.vagaId)
                      const getInitials = (name: string) => {
                        return name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      }

                      return (
                        <Card
                          key={candidatura.id}
                          className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => {
                            setCandidaturaSelecionada(candidatura)
                            setDialogOpen(true)
                          }}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {candidato?.nome ? getInitials(candidato.nome) : "C"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{candidato?.nome || "Candidato"}</p>
                                <p className="text-xs text-muted-foreground truncate">{vaga?.titulo || "Vaga"}</p>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {colunas
                                .filter((c) => c.id !== coluna.id)
                                .map((col) => (
                                  <Button
                                    key={col.id}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs px-2"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      moverCandidatura(candidatura.id, col.id)
                                    }}
                                  >
                                    {col.id === "aprovado" || col.id === "rejeitado" ? (
                                      col.id === "aprovado" ? (
                                        <CheckCircle2 className="h-3 w-3" />
                                      ) : (
                                        <XCircle className="h-3 w-3" />
                                      )
                                    ) : (
                                      <ArrowRight className="h-3 w-3" />
                                    )}
                                  </Button>
                                ))}
                            </div>
                          </div>
                        </Card>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Dialog de Detalhes */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes da Candidatura</DialogTitle>
              <DialogDescription>
                {candidaturaSelecionada && (
                  <>
                    {mockUsers.find((u) => u.id === candidaturaSelecionada.candidatoId)?.nome} -{" "}
                    {mockVagas.find((v) => v.id === candidaturaSelecionada.vagaId)?.titulo}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {candidaturaSelecionada && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Status Atual</h4>
                  <Badge variant={getStatusBadge(candidaturaSelecionada.status)}>
                    {colunas.find((c) => c.id === candidaturaSelecionada.status)?.titulo}
                  </Badge>
                </div>
                {candidaturaSelecionada.mensagem && (
                  <div>
                    <h4 className="font-semibold mb-2">Mensagem do Candidato</h4>
                    <p className="text-sm text-muted-foreground">{candidaturaSelecionada.mensagem}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-2">Mover para:</h4>
                  <div className="flex flex-wrap gap-2">
                    {colunas
                      .filter((c) => c.id !== candidaturaSelecionada.status)
                      .map((col) => (
                        <Button
                          key={col.id}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            moverCandidatura(candidaturaSelecionada.id, col.id)
                            setDialogOpen(false)
                          }}
                        >
                          {col.titulo}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

