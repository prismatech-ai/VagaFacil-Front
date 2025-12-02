// Dashboard route under /admin/dashboard
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Building2, Briefcase, FileText, UserCircle, Eye, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { mockUsers, mockVagas, mockCandidaturas } from "@/lib/mock-data"
import { api } from "@/lib/api"
import { useEffect } from "react"
import type { User, Vaga, Candidatura } from "@/lib/types"

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // #colocarRota - Ajuste as rotas conforme seu backend
      const [usersData, vagasData, candidaturasData] = await Promise.all([
        api.get<User[]>("/api/v1/admin/usuarios").catch(() => {
          console.warn("Erro ao carregar usuários, usando dados mockados")
          return mockUsers
        }),
        api.get<Vaga[]>("/api/v1/admin/vagas").catch(() => {
          console.warn("Erro ao carregar vagas, usando dados mockados")
          return mockVagas
        }),
        api.get<Candidatura[]>("/api/v1/admin/candidaturas").catch(() => {
          console.warn("Erro ao carregar candidaturas, usando dados mockados")
          return mockCandidaturas
        }),
      ])

      setUsers(Array.isArray(usersData) ? usersData : mockUsers)
      setVagas(Array.isArray(vagasData) ? vagasData : mockVagas)
      setCandidaturas(Array.isArray(candidaturasData) ? candidaturasData : mockCandidaturas)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      // Fallback para dados mockados
      setUsers(mockUsers)
      setVagas(mockVagas)
      setCandidaturas(mockCandidaturas)
    } finally {
      setLoading(false)
    }
  }

  const empresas = users.filter((u) => u.role === "empresa")
  const candidatos = users.filter((u) => u.role === "candidato")
  const vagasAbertas = vagas.filter((v) => v.status === "aberta")

  const { novosUsuarios, comparativoUsuarios, comparativoEmpresas, comparativoVagas } = useMemo(() => {
    const hoje = new Date()
    const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sessentaDiasAtras = new Date(hoje.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Novos usuários últimos 30 dias
    const novosUsuarios = users.filter((u) => u.createdAt >= trintaDiasAtras).length

    // Usuários do período anterior (30-60 dias atrás)
    const usuariosPeriodoAnterior = users.filter(
      (u) => u.createdAt >= sessentaDiasAtras && u.createdAt < trintaDiasAtras,
    ).length

    // Comparativo de usuários
    const comparativoUsuarios =
      usuariosPeriodoAnterior > 0
        ? (((novosUsuarios - usuariosPeriodoAnterior) / usuariosPeriodoAnterior) * 100).toFixed(1)
        : novosUsuarios > 0
          ? "100"
          : "0"

    // Novas empresas últimos 30 dias
    const novasEmpresas = empresas.filter((e) => e.createdAt >= trintaDiasAtras).length
    const empresasPeriodoAnterior = empresas.filter(
      (e) => e.createdAt >= sessentaDiasAtras && e.createdAt < trintaDiasAtras,
    ).length
    const comparativoEmpresas =
      empresasPeriodoAnterior > 0
        ? (((novasEmpresas - empresasPeriodoAnterior) / empresasPeriodoAnterior) * 100).toFixed(1)
        : novasEmpresas > 0
          ? "100"
          : "0"

    // Novas vagas últimos 30 dias
    const novasVagas = vagas.filter((v) => v.createdAt >= trintaDiasAtras).length
    const vagasPeriodoAnterior = vagas.filter(
      (v) => v.createdAt >= sessentaDiasAtras && v.createdAt < trintaDiasAtras,
    ).length
    const comparativoVagas =
      vagasPeriodoAnterior > 0
        ? (((novasVagas - vagasPeriodoAnterior) / vagasPeriodoAnterior) * 100).toFixed(1)
        : novasVagas > 0
          ? "100"
          : "0"

    return { novosUsuarios, comparativoUsuarios, comparativoEmpresas, comparativoVagas }
  }, [users, empresas, vagas])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      aberta: "default",
      fechada: "secondary",
      pendente: "outline",
      em_analise: "secondary",
      aprovado: "default",
      rejeitado: "destructive",
    }
    return variants[status] || "outline"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      aberta: "Aberta",
      fechada: "Fechada",
      pendente: "Pendente",
      em_analise: "Em Análise",
      aprovado: "Aprovado",
      rejeitado: "Rejeitado",
    }
    return labels[status] || status
  }

  const TrendIndicator = ({ value }: { value: string }) => {
    const numValue = Number.parseFloat(value)
    if (numValue === 0) return null

    return (
      <div className={`flex items-center gap-1 text-xs ${numValue > 0 ? "text-green-600" : "text-red-600"}`}>
        {numValue > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{Math.abs(numValue)}%</span>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Painel Administrativo</h2>
        <p className="text-muted-foreground">Visão completa do sistema e gerenciamento de usuários</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{novosUsuarios} novos últimos 30 dias</p>
              <TrendIndicator value={comparativoUsuarios} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{empresas.length}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Cadastradas no sistema</p>
              <TrendIndicator value={comparativoEmpresas} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vagas Abertas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vagasAbertas.length}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">De {vagas.length} vagas totais</p>
              <TrendIndicator value={comparativoVagas} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidaturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidaturas.length}</div>
            <p className="text-xs text-muted-foreground">Total de candidaturas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Gerenciamento */}
      <Tabs defaultValue="usuarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="vagas">Vagas</TabsTrigger>
          <TabsTrigger value="candidaturas">Candidaturas</TabsTrigger>
        </TabsList>

        {/* Tab de Usuários */}
        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Usuários</CardTitle>
              <CardDescription>Gerencie todos os usuários cadastrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {u.role === "empresa" ? (
                          <Building2 className="h-5 w-5 text-primary" />
                        ) : u.role === "candidato" ? (
                          <UserCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Users className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{u.nome}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {u.role === "admin" ? "Admin" : u.role === "empresa" ? "Empresa" : "Candidato"}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Vagas */}
        <TabsContent value="vagas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Vagas</CardTitle>
              <CardDescription>Visualize e gerencie todas as vagas publicadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vagas.map((vaga) => {
                  const empresa = users.find((u) => u.id === vaga.empresaId)
                  return (
                    <div
                      key={vaga.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{vaga.titulo}</h3>
                          <Badge variant={getStatusBadge(vaga.status)}>{getStatusLabel(vaga.status)}</Badge>
                          <Badge variant="outline">{vaga.tipo}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {empresa?.nome} • {vaga.localizacao}
                        </p>
                        <p className="text-sm line-clamp-2">{vaga.descricao}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Candidaturas */}
        <TabsContent value="candidaturas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Candidaturas</CardTitle>
              <CardDescription>Acompanhe todas as candidaturas do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidaturas.map((candidatura) => {
                  const vaga = vagas.find((v) => v.id === candidatura.vagaId)
                  const candidato = users.find((u) => u.id === candidatura.candidatoId)
                  return (
                    <div
                      key={candidatura.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{vaga?.titulo}</h3>
                          <Badge variant={getStatusBadge(candidatura.status)}>
                            {getStatusLabel(candidatura.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Candidato: {candidato?.nome}</p>
                        {candidatura.mensagem && <p className="text-sm line-clamp-2">{candidatura.mensagem}</p>}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
