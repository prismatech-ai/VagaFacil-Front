"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface VagaSummary {
  id: string
  titulo: string
  status: string
  candidatos_count: number
}

interface Candidato {
  id_anonimo: string
  nome?: string
  email?: string
  area_atuacao?: string
  estado?: string
  cidade?: string
}

export default function EmpresaDashboardPage() {
  const router = useRouter()
  const [vagas, setVagas] = useState<VagaSummary[]>([])
  const [allVagas, setAllVagas] = useState<VagaSummary[]>([])
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVagas: 0,
    vagasAbertas: 0,
    totalCandidatos: 0,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch vagas
      const vagasResponse = await api.get("/api/v1/jobs")
      const vagasList = (vagasResponse as any).data || vagasResponse
      
      const vagasAbertas = vagasList.filter((v: any) => v.status === "aberta")
      const totalCandidatos = vagasList.reduce((acc: number, v: any) => acc + (v.candidatos_count || 0), 0)

      setVagas(vagasList.slice(0, 5))
      setAllVagas(vagasList)
      setStats({
        totalVagas: vagasList.length,
        vagasAbertas: vagasAbertas.length,
        totalCandidatos: totalCandidatos,
      })

      // Fetch candidatos
      const candidatosResponse = await api.get("/api/v1/companies/candidatos-anonimos")
      const candidatosList = (candidatosResponse as any).data || candidatosResponse
      setCandidatos(candidatosList)
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      aberta: "bg-green-100 text-green-800",
      fechada: "bg-red-100 text-red-800",
      rascunho: "bg-yellow-100 text-yellow-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao seu painel de controle</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Vagas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.totalVagas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Vagas Abertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.vagasAbertas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Candidatos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalCandidatos}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="recentes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recentes">Vagas Recentes</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="candidatos">Todos os Candidatos</TabsTrigger>
            </TabsList>

            {/* Vagas Recentes Tab */}
            <TabsContent value="recentes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vagas Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {vagas.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhuma vaga criada ainda</p>
                  ) : (
                    <div className="space-y-4">
                      {vagas.map((vaga) => (
                        <div
                          key={vaga.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                          onClick={() => router.push(`/empresa/jobs/${vaga.id}`)}
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{vaga.titulo}</h3>
                            <p className="text-sm text-gray-600">{vaga.candidatos_count} candidatos</p>
                          </div>
                          <Badge className={getStatusColor(vaga.status)}>
                            {vaga.status === "aberta" ? "Ativa" : vaga.status === "fechada" ? "Inativa" : "Rascunho"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Kanban Tab */}
            <TabsContent value="kanban" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Kanban de Vagas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allVagas.length === 0 ? (
                      <p className="text-gray-500 text-center py-8 col-span-full">Nenhuma vaga criada ainda</p>
                    ) : (
                      allVagas.map((vaga) => (
                        <div
                          key={vaga.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition"
                          onClick={() => router.push(`/empresa/jobs/${vaga.id}`)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-2">{vaga.titulo}</h3>
                              <p className="text-sm text-gray-600">Candidatos: {vaga.candidatos_count}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Badge className={getStatusColor(vaga.status)}>
                              {vaga.status === "aberta" ? "Ativa" : vaga.status === "fechada" ? "Inativa" : "Rascunho"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Todos os Candidatos Tab */}
            <TabsContent value="candidatos" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Todos os Candidatos</CardTitle>
                </CardHeader>
                <CardContent>
                  {candidatos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum candidato encontrado</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Área de Atuação</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Cidade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {candidatos.map((candidato) => (
                            <tr key={candidato.id_anonimo} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-700">{candidato.id_anonimo}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{candidato.area_atuacao || "-"}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{candidato.estado || "-"}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{candidato.cidade || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
