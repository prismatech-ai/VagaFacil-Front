"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Award, Send, Eye } from "lucide-react"
import { mockUsers, mockVagas } from "@/lib/mock-data"
import type { Candidato, Vaga } from "@/lib/types"

export default function BancoTalentosPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<Candidato | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [conviteDialogOpen, setConviteDialogOpen] = useState(false)
  const [vagaSelecionada, setVagaSelecionada] = useState<string>("")
  const [filtros, setFiltros] = useState({
    busca: "",
    localizacao: "",
    pontuacaoMinima: "",
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role !== "empresa") {
      router.push("/dashboard")
    }

    // Filtrar apenas candidatos
    const todosCandidatos = mockUsers.filter((u) => u.role === "candidato") as Candidato[]
    setCandidatos(todosCandidatos)
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

  const candidatosFiltrados = candidatos.filter((candidato) => {
    const matchBusca =
      !filtros.busca ||
      candidato.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      candidato.habilidades?.some((h) => h.toLowerCase().includes(filtros.busca.toLowerCase()))

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

  const handleConvite = () => {
    if (!vagaSelecionada || !candidatoSelecionado) return

    // Aqui você faria a chamada à API para enviar o convite
    alert(`Convite enviado para ${candidatoSelecionado.nome} para a vaga selecionada!`)
    setConviteDialogOpen(false)
    setVagaSelecionada("")
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <DashboardHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
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
                        {candidato.habilidades.slice(0, 5).map((habilidade) => (
                          <Badge key={habilidade} variant="outline" className="text-xs">
                            {habilidade}
                          </Badge>
                        ))}
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
                      {candidatoSelecionado.habilidades.map((habilidade) => (
                        <Badge key={habilidade} variant="outline">
                          {habilidade}
                        </Badge>
                      ))}
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
                <Select value={vagaSelecionada} onValueChange={setVagaSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma vaga" />
                  </SelectTrigger>
                  <SelectContent>
                    {minhasVagas
                      .filter((v) => v.status === "aberta")
                      .map((vaga) => (
                        <SelectItem key={vaga.id} value={vaga.id}>
                          {vaga.titulo}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setConviteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleConvite} disabled={!vagaSelecionada}>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Convite
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
