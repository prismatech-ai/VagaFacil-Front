"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Search, Users } from "lucide-react"
import { mockUsers, mockVagas, mockCandidaturas } from "@/lib/mock-data"
import type { Candidato, Candidatura, Vaga } from "@/lib/types"

export default function GestaoCandidatosPorVagaPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [todasVagas] = useState<Vaga[]>(mockVagas)
  const [todasCandidaturas, setTodasCandidaturas] = useState<Candidatura[]>(
    mockCandidaturas.map((c) => ({ ...c }))
  )

  const minhasVagas = useMemo(() => {
    if (!user) return []
    return todasVagas.filter((v) => v.empresaId === user.id)
  }, [todasVagas, user])

  const [vagaId, setVagaId] = useState<string>("")
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<
    "" | "pendente" | "em_analise" | "entrevista" | "finalista" | "aprovado" | "rejeitado"
  >("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<Candidato | null>(null)
  const [candidaturaSelecionada, setCandidaturaSelecionada] = useState<Candidatura | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }
    if (user && user.role !== "empresa") {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (minhasVagas.length > 0 && !vagaId) {
      setVagaId(minhasVagas[0].id)
    }
  }, [minhasVagas, vagaId])

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pendente: "outline",
      em_analise: "secondary",
      entrevista: "secondary",
      finalista: "default",
      aprovado: "default",
      rejeitado: "destructive",
    }
    return variants[status] || "outline"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: "Pendente",
      em_analise: "Em Análise",
      entrevista: "Entrevista",
      finalista: "Finalista",
      aprovado: "Aprovado",
      rejeitado: "Rejeitado",
    }
    return labels[status] || status
  }

  const candidaturasVaga = useMemo(() => {
    return todasCandidaturas.filter((c) => c.vagaId === vagaId)
  }, [todasCandidaturas, vagaId])

  const linhas = useMemo(() => {
    const buscaLower = busca.trim().toLowerCase()
    return candidaturasVaga
      .filter((c) => (statusFiltro ? c.status === statusFiltro : true))
      .map((c) => {
        const cand = mockUsers.find((u) => u.id === c.candidatoId && u.role === "candidato") as
          | Candidato
          | undefined
        return { candid: cand, candidatura: c }
      })
      .filter(({ candid }) => {
        if (!candid) return false
        if (!buscaLower) return true
        return (
          candid.nome.toLowerCase().includes(buscaLower) ||
          candid.email.toLowerCase().includes(buscaLower) ||
          (candid.habilidades?.some((h) => h.toLowerCase().includes(buscaLower)) ?? false)
        )
      })
  }, [candidaturasVaga, statusFiltro, busca])

  const alterarStatus = (id: string, novoStatus: Candidatura["status"]) => {
    setTodasCandidaturas((prev) => prev.map((c) => (c.id === id ? { ...c, status: novoStatus } : c)))
  }

  const abrirPerfil = (c: Candidato, candit: Candidatura) => {
    setCandidatoSelecionado(c)
    setCandidaturaSelecionada(candit)
    setDialogOpen(true)
  }

  const vagaSelecionada = minhasVagas.find((v) => v.id === vagaId)

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Gestão de Candidatos por Vaga</h2>
          <p className="text-muted-foreground">
            Selecione uma vaga e gerencie os candidatos aplicados
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Vaga, status e busca por candidato</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vaga">Vaga</Label>
                <Select value={vagaId} onValueChange={setVagaId}>
                  <SelectTrigger id="vaga">
                    <SelectValue placeholder="Selecione a vaga" />
                  </SelectTrigger>
                  <SelectContent>
                    {minhasVagas.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFiltro} onValueChange={(v) => setStatusFiltro((v === "all" ? "" : v) as any)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="entrevista">Entrevista</SelectItem>
                    <SelectItem value="finalista">Finalista</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="busca">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="busca"
                    placeholder="Nome, email ou habilidade..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo da vaga */}
        {vagaSelecionada && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{vagaSelecionada.titulo}</CardTitle>
              <CardDescription>{vagaSelecionada.localizacao} • {vagaSelecionada.tipo}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Candidatos:</span> {candidaturasVaga.length}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge variant="outline">{vagaSelecionada.status === "aberta" ? "Aberta" : "Fechada"}</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de candidatos */}
        <Card>
          <CardHeader>
            <CardTitle>Candidatos</CardTitle>
            <CardDescription>
              {linhas.length} resultado{linhas.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidato</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[220px]">Alterar Etapa</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linhas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum candidato para os filtros selecionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    linhas.map(({ candid, candidatura }) => (
                      <TableRow key={candidatura.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {candid ? getInitials(candid.nome) : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{candid?.nome ?? "N/A"}</div>
                              {candid?.telefone && (
                                <div className="text-xs text-muted-foreground">{candid.telefone}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">{candid?.email ?? "-"}</TableCell>
                        <TableCell className="align-top">
                          <Badge variant={getStatusBadge(candidatura.status)}>
                            {getStatusLabel(candidatura.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="align-top">
                          <Select
                            value={candidatura.status}
                            onValueChange={(v) => alterarStatus(candidatura.id, v as Candidatura["status"])}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="em_analise">Em Análise</SelectItem>
                              <SelectItem value="entrevista">Entrevista</SelectItem>
                              <SelectItem value="finalista">Finalista</SelectItem>
                              <SelectItem value="aprovado">Aprovado</SelectItem>
                              <SelectItem value="rejeitado">Rejeitado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          {candid && (
                            <Button variant="ghost" size="sm" onClick={() => abrirPerfil(candid, candidatura)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog Perfil do Candidato */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Perfil do Candidato</DialogTitle>
              <DialogDescription>
                {candidatoSelecionado?.nome} • {candidatoSelecionado?.email}
              </DialogDescription>
            </DialogHeader>
            {candidatoSelecionado && candidaturaSelecionada && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusBadge(candidaturaSelecionada.status)}>
                    {getStatusLabel(candidaturaSelecionada.status)}
                  </Badge>
                </div>
                {candidatoSelecionado.telefone && (
                  <p className="text-sm">
                    <span className="font-medium">Telefone:</span> {candidatoSelecionado.telefone}
                  </p>
                )}
                {candidatoSelecionado.localizacao && (
                  <p className="text-sm">
                    <span className="font-medium">Localização:</span> {candidatoSelecionado.localizacao}
                  </p>
                )}
                {candidatoSelecionado.curriculo && (
                  <div>
                    <h4 className="font-semibold mb-2">Resumo Profissional</h4>
                    <p className="text-sm text-muted-foreground">{candidatoSelecionado.curriculo}</p>
                  </div>
                )}
                {candidatoSelecionado.habilidades && candidatoSelecionado.habilidades.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Habilidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidatoSelecionado.habilidades.map((h) => (
                        <Badge key={h} variant="outline">
                          {h}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}


