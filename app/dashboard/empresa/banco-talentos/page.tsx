"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { EmpresaSidebar } from "@/components/empresa-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Award, Send, Eye } from "lucide-react"
import type { Candidato, Vaga } from "@/lib/types"
import { toast } from "sonner"

export default function BancoTalentosPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<Candidato | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [conviteDialogOpen, setConviteDialogOpen] = useState(false)
  const [vagaSelecionada, setVagaSelecionada] = useState<string>("")
  const [loadingVagas, setLoadingVagas] = useState(false)
  const [filtros, setFiltros] = useState({
    busca: "",
    localizacao: "",
    pontuacaoMinima: "",
  })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role !== "empresa") {
      router.push("/dashboard")
      return
    }

    if (user && user.role === "empresa") {
      loadCandidatos()
      loadVagas()
    }
  }, [user, isLoading, router])

  const loadCandidatos = async () => {
    try {
      setLoadingData(true)
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Token não encontrado')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      console.log('NEXT_PUBLIC_API_URL:', apiUrl)

      if (!apiUrl) {
        toast.error('Variável de ambiente não configurada', {
          description: 'NEXT_PUBLIC_API_URL não está definida',
          duration: 5000
        })
        return
      }

      const url = `${apiUrl}/api/v1/companies/todos-candidatos`
      console.log('Carregando candidatos de:', url)
      console.log('Token:', token?.slice(0, 20) + '...')

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (response.status === 401) {
        toast.error('Sessão expirada')
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      if (response.ok) {
        const data = await response.json()
        console.log('Dados recebidos:', data)
        const candidatosData = Array.isArray(data) ? data : (data.candidatos || data.data || [])
        const candidatosMapeados = candidatosData.map((c: any) => ({
          id: c.id,
          nome: c.nome_completo || c.nome,
          email: c.email,
          role: 'candidato' as const,
          telefone: c.telefone,
          localizacao: c.cidade && c.estado ? `${c.cidade} - ${c.estado}` : c.localizacao,
          curriculo: c.profissao,
          habilidades: c.habilidades || [],
          anosExperiencia: c.anos_experiencia,
          educacao: c.educacao || [],
          experiencias: c.experiencias || [],
          linkedin: c.linkedin,
          createdAt: new Date(c.criado_em || Date.now())
        }))
        setCandidatos(candidatosMapeados)
        toast.success(`${candidatosMapeados.length} candidatos carregados`)
      } else {
        const errorText = await response.text()
        console.error('Erro na resposta:', response.status, errorText)
        toast.error('Erro ao carregar candidatos', {
          description: `Status ${response.status}: ${errorText || response.statusText}`,
          duration: 5000
        })
        setCandidatos([])
      }
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Detalhes do erro:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      })
      
      toast.error('Erro ao carregar candidatos', {
        description: errorMessage,
        duration: 5000
      })
      setCandidatos([])
    } finally {
      setLoadingData(false)

    }
  }

  const loadVagas = async () => {
    try {
      setLoadingVagas(true)
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('Token não encontrado')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const url = `${apiUrl}/api/v1/jobs/`
      console.log('Carregando vagas de:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Response vagas status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Dados vagas recebidos:', data)
        const vagasData = Array.isArray(data) ? data : (data.vagas || data.data || [])
        console.log('Vagas data:', vagasData)
        
        const vagasMapeadas = vagasData.map((v: any) => ({
          id: v.id,
          empresaId: v.company_id || user?.id || '',
          titulo: v.title,
          descricao: v.description,
          requisitos: v.requirements || '',
          localizacao: v.location,
          tipo: v.job_type,
          status: v.status || 'aberta',
          createdAt: new Date(v.created_at || Date.now()),
          salarioMin: v.salary_min,
          salarioMax: v.salary_max
        }))
        
        
        setVagas(vagasMapeadas)
        
        setVagas(vagasMapeadas)
      } else {
        const errorText = await response.text()
        console.error('Erro ao carregar vagas:', response.status, errorText)
        setVagas([])
      }
    } catch (error) {
      console.error('Erro ao buscar vagas:', error)
      setVagas([])
    } finally {
      setLoadingVagas(false)
    }
  }

  if (isLoading || !user || user.role !== "empresa" || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const candidatosFiltrados = candidatos.filter((candidato) => {
    const matchBusca =
      !filtros.busca ||
      candidato.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      candidato.habilidades?.some((h) => {
        const habilidadeStr = typeof h === 'string' ? h : (h?.habilidade || '')
        return habilidadeStr.toLowerCase().includes(filtros.busca.toLowerCase())
      })

    const matchLocalizacao = !filtros.localizacao || candidato.localizacao?.includes(filtros.localizacao)

    return matchBusca && matchLocalizacao
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleConvite = async () => {
    if (!vagaSelecionada || !candidatoSelecionado) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Token não encontrado')
        return
      }

      console.log('Enviando convite com:', {
        candidato_id: candidatoSelecionado.id,
        vaga_id: vagaSelecionada,
        tipo_vaga_id: typeof vagaSelecionada
      })
      console.log('Vagas disponíveis:', vagas)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/convites/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          candidato_id: candidatoSelecionado.id,
          vaga_id: parseInt(vagaSelecionada)
        })
      })

      console.log('Response convite:', response.status)

      if (response.status === 401) {
        toast.error('Sessão expirada')
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro response:', errorText)
        throw new Error(errorText || response.statusText)
      }

      const data = await response.json()
      console.log('Convite enviado com sucesso:', data)

      toast.success(`Convite enviado para ${candidatoSelecionado.nome}!`, {
        description: 'O candidato receberá uma notificação',
        duration: 4000
      })
      setConviteDialogOpen(false)
      setVagaSelecionada("")
    } catch (error) {
      console.error('Erro ao enviar convite:', error)
      toast.error('Erro ao enviar convite', {
        description: (error as Error).message,
        duration: 5000
      })
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-secondary/30">
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden">
          <EmpresaSidebar />

          <main className="flex-1 overflow-y-auto container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Banco de Talentos</h2>
          <p className="text-muted-foreground">Encontre e convide os melhores candidatos para suas vagas</p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtre candidatos por habilidades, localização e pontuação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="busca">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="busca"
                    placeholder="Nome ou habilidades..."
                    value={filtros.busca}
                    onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  placeholder="Ex: São Paulo - SP"
                  value={filtros.localizacao}
                  onChange={(e) => setFiltros({ ...filtros, localizacao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pontuacao">Pontuação Mínima</Label>
                <Input
                  id="pontuacao"
                  type="number"
                  placeholder="Ex: 70"
                  value={filtros.pontuacaoMinima}
                  onChange={(e) => setFiltros({ ...filtros, pontuacaoMinima: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Candidatos */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {candidatosFiltrados.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum candidato encontrado</h3>
                <p className="text-muted-foreground text-center">Tente ajustar os filtros de busca</p>
              </CardContent>
            </Card>
          ) : (
            candidatosFiltrados.map((candidato) => (
              <Card key={candidato.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(candidato.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{candidato.nome}</CardTitle>
                      <CardDescription>{candidato.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidato.localizacao && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {candidato.localizacao}
                    </div>
                  )}

                  {candidato.habilidades && candidato.habilidades.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Habilidades:</p>
                      <div className="flex flex-wrap gap-2">
                        {candidato.habilidades.slice(0, 5).map((habilidade, idx) => {
                          const habilidadeStr = typeof habilidade === 'string' ? habilidade : (habilidade?.habilidade || '')
                          return (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {habilidadeStr}
                            </Badge>
                          )
                        })}
                        {candidato.habilidades.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidato.habilidades.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {candidato.curriculo && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{candidato.curriculo}</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setCandidatoSelecionado(candidato)
                        setDialogOpen(true)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Perfil
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setCandidatoSelecionado(candidato)
                        setConviteDialogOpen(true)
                      }}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Convidar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialog de Perfil Completo */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Perfil Completo do Candidato</DialogTitle>
              <DialogDescription>
                {candidatoSelecionado?.nome} - {candidatoSelecionado?.email}
              </DialogDescription>
            </DialogHeader>
            {candidatoSelecionado && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Informações Pessoais</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Email:</span> {candidatoSelecionado.email}
                    </p>
                    {candidatoSelecionado.telefone && (
                      <p>
                        <span className="font-medium">Telefone:</span> {candidatoSelecionado.telefone}
                      </p>
                    )}
                    {candidatoSelecionado.localizacao && (
                      <p>
                        <span className="font-medium">Localização:</span> {candidatoSelecionado.localizacao}
                      </p>
                    )}
                  </div>
                </div>

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
                      {candidatoSelecionado.habilidades.map((habilidade, idx) => {
                        const habilidadeStr = typeof habilidade === 'string' ? habilidade : (habilidade?.habilidade || '')
                        return (
                          <Badge key={idx} variant="outline">
                            {habilidadeStr}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}

                {candidatoSelecionado.educacao && candidatoSelecionado.educacao.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Formação</h4>
                    <div className="space-y-2">
                      {candidatoSelecionado.educacao.map((edu) => (
                        <div key={edu.id} className="p-3 border rounded-lg">
                          <p className="font-medium">{edu.curso}</p>
                          <p className="text-sm text-muted-foreground">{edu.instituicao}</p>
                          <p className="text-sm text-muted-foreground">
                            {edu.nivel} • {edu.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {candidatoSelecionado.experiencias && candidatoSelecionado.experiencias.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Experiência Profissional</h4>
                    <div className="space-y-2">
                      {candidatoSelecionado.experiencias.map((exp) => (
                        <div key={exp.id} className="p-3 border rounded-lg">
                          <p className="font-medium">{exp.cargo}</p>
                          <p className="text-sm text-muted-foreground">{exp.empresa}</p>
                          <p className="text-sm text-muted-foreground">
                            {exp.dataInicio.toLocaleDateString("pt-BR")} -{" "}
                            {exp.atual ? "Atual" : exp.dataFim?.toLocaleDateString("pt-BR")}
                          </p>
                          {exp.descricao && <p className="text-sm mt-2">{exp.descricao}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {candidatoSelecionado.linkedin && (
                  <div>
                    <h4 className="font-semibold mb-2">Links</h4>
                    <a
                      href={candidatoSelecionado.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Convite */}
        <Dialog open={conviteDialogOpen} onOpenChange={setConviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Candidato</DialogTitle>
              <DialogDescription>
                Selecione a vaga para a qual deseja convidar {candidatoSelecionado?.nome}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vaga">Vaga</Label>
                {loadingVagas ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Carregando vagas...
                  </div>
                ) : vagas.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Nenhuma vaga aberta disponível
                  </div>
                ) : (
                  <Select value={vagaSelecionada} onValueChange={setVagaSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma vaga" />
                    </SelectTrigger>
                    <SelectContent>
                      {vagas
                        .filter((v) => v.status === "aberta")
                        .map((vaga) => (
                          <SelectItem key={vaga.id} value={vaga.id.toString()}>
                            {vaga.titulo}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setConviteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleConvite} disabled={!vagaSelecionada || loadingVagas}>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Convite
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      </div>
      </div>
    </SidebarProvider>
  )
}
