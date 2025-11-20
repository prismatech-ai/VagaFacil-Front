// Dashboard route under /admin/dashboard
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Building2, Briefcase, FileText, UserCircle, Eye, Trash2 } from "lucide-react"
import { mockUsers, mockVagas, mockCandidaturas } from "@/lib/mock-data"

export default function AdminDashboardPage() {
  const [users, setUsers] = useState(mockUsers)
  const [vagas, setVagas] = useState(mockVagas)
  const [candidaturas, setCandidaturas] = useState(mockCandidaturas)

  const empresas = users.filter((u) => u.role === "empresa")
  const candidatos = users.filter((u) => u.role === "candidato")
  const vagasAbertas = vagas.filter((v) => v.status === "aberta")

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
              <p className="text-xs text-muted-foreground">
                {empresas.length} empresas, {candidatos.length} candidatos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{empresas.length}</div>
              <p className="text-xs text-muted-foreground">Cadastradas no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vagas Abertas</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vagasAbertas.length}</div>
              <p className="text-xs text-muted-foreground">De {vagas.length} vagas totais</p>
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


