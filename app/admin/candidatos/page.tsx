// Copied from old candidatos page
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, Pencil, Search, Trash2, MapPin, Link as LinkIcon, Plus } from "lucide-react"
import { mockUsers } from "@/lib/mock-data"
import type { Candidato } from "@/lib/types"

export default function AdminCandidatosPage() {
  const initialCandidatos = useMemo(
    () => (mockUsers.filter((u) => u.role === "candidato") as Candidato[]).map((c) => ({ ...c })),
    []
  )
  const [candidatos, setCandidatos] = useState<Candidato[]>(initialCandidatos)
  const [filtros, setFiltros] = useState({
    busca: "",
    localizacao: "",
    habilidade: "",
  })

  const [dialogVerOpen, setDialogVerOpen] = useState(false)
  const [dialogEditarOpen, setDialogEditarOpen] = useState(false)
  const [conviteDialogOpen, setConviteDialogOpen] = useState(false)
  const [emailConvite, setEmailConvite] = useState("")
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<Candidato | null>(null)
  const [formEdicao, setFormEdicao] = useState({
    nome: "",
    email: "",
    telefone: "",
    localizacao: "",
    linkedin: "",
    habilidades: "",
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const candidatosFiltrados = useMemo(() => {
    const busca = filtros.busca.trim().toLowerCase()
    const local = filtros.localizacao.trim().toLowerCase()
    const hab = filtros.habilidade.trim().toLowerCase()
    return candidatos.filter((c) => {
      const matchBusca =
        !busca ||
        c.nome.toLowerCase().includes(busca) ||
        c.email.toLowerCase().includes(busca) ||
        (c.curriculo?.toLowerCase().includes(busca) ?? false)
      const matchLocal = !local || (c.localizacao?.toLowerCase().includes(local) ?? false)
      const matchHab =
        !hab || (c.habilidades?.some((h) => h.toLowerCase().includes(hab)) ?? false)
      return matchBusca && matchLocal && matchHab
    })
  }, [candidatos, filtros])

  const abrirVer = (cand: Candidato) => {
    setCandidatoSelecionado(cand)
    setDialogVerOpen(true)
  }

  const abrirEditar = (cand: Candidato) => {
    setCandidatoSelecionado(cand)
    setFormEdicao({
      nome: cand.nome ?? "",
      email: cand.email ?? "",
      telefone: cand.telefone ?? "",
      localizacao: cand.localizacao ?? "",
      linkedin: cand.linkedin ?? "",
      habilidades: cand.habilidades?.join(", ") ?? "",
    })
    setDialogEditarOpen(true)
  }

  const salvarEdicao = () => {
    if (!candidatoSelecionado) return
    const habilidades = formEdicao.habilidades
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean)
    setCandidatos((prev) =>
      prev.map((c) =>
        c.id === candidatoSelecionado.id
          ? {
              ...c,
              nome: formEdicao.nome,
              email: formEdicao.email,
              telefone: formEdicao.telefone || undefined,
              localizacao: formEdicao.localizacao || undefined,
              linkedin: formEdicao.linkedin || undefined,
              habilidades,
            }
          : c
      )
    )
    setDialogEditarOpen(false)
  }

  const removerCandidato = (id: string) => {
    setCandidatos((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Gestão de Candidatos</h2>
          <p className="text-muted-foreground">
            Lista completa de candidatos com filtros e ações administrativas
          </p>
        </div>
        <Button onClick={() => setConviteDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Convidar Candidato
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque por nome, email, localização e habilidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Nome, email ou palavras-chave..."
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
              <Label htmlFor="habilidade">Habilidade</Label>
              <Input
                id="habilidade"
                placeholder="Ex: React, Solda, Elétrica..."
                value={filtros.habilidade}
                onChange={(e) => setFiltros({ ...filtros, habilidade: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Convidar Candidato */}
      <Dialog open={conviteDialogOpen} onOpenChange={setConviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar Candidato</DialogTitle>
            <DialogDescription>
              Informe o e-mail do candidato. Ele receberá um link para realizar o cadastro e onboarding.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-convite">E-mail do candidato</Label>
              <Input
                id="email-convite"
                type="email"
                placeholder="nome@exemplo.com"
                value={emailConvite}
                onChange={(e) => setEmailConvite(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setConviteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" disabled={!emailConvite.trim()} onClick={() => setConviteDialogOpen(false)}>
                Enviar Convite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Candidatos</CardTitle>
          <CardDescription>{candidatosFiltrados.length} resultados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Habilidades</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidatosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum candidato encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  candidatosFiltrados.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(c.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{c.nome}</div>
                            {c.telefone && (
                              <div className="text-xs text-muted-foreground">{c.telefone}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">{c.email}</TableCell>
                      <TableCell className="align-top">
                        <div className="flex items-center gap-2 text-sm">
                          {c.localizacao && <MapPin className="h-4 w-4 text-muted-foreground" />}
                          {c.localizacao || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-wrap gap-1 max-w-[360px]">
                          {(c.habilidades ?? []).slice(0, 4).map((h) => (
                            <Badge key={h} variant="outline" className="text-xs">
                              {h}
                            </Badge>
                          ))}
                          {(c.habilidades?.length ?? 0) > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{(c.habilidades?.length ?? 0) - 4}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => abrirVer(c)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => abrirEditar(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removerCandidato(c.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Ver Perfil */}
      <Dialog open={dialogVerOpen} onOpenChange={setDialogVerOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Candidato</DialogTitle>
            <DialogDescription>
              {candidatoSelecionado?.nome} - {candidatoSelecionado?.email}
            </DialogDescription>
          </DialogHeader>
          {candidatoSelecionado && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Informações Pessoais</h4>
                <div className="space-y-1 text-sm">
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
                  {candidatoSelecionado.linkedin && (
                    <p className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      <a
                        href={candidatoSelecionado.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        LinkedIn
                      </a>
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Candidato */}
      <Dialog open={dialogEditarOpen} onOpenChange={setDialogEditarOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Candidato</DialogTitle>
            <DialogDescription>Atualize informações básicas do candidato</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formEdicao.nome}
                  onChange={(e) => setFormEdicao((f) => ({ ...f, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formEdicao.email}
                  onChange={(e) => setFormEdicao((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formEdicao.telefone}
                  onChange={(e) => setFormEdicao((f) => ({ ...f, telefone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  value={formEdicao.localizacao}
                  onChange={(e) => setFormEdicao((f) => ({ ...f, localizacao: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formEdicao.linkedin}
                  onChange={(e) => setFormEdicao((f) => ({ ...f, linkedin: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="habilidades">Habilidades</Label>
                <Input
                  id="habilidades"
                  placeholder="Separadas por vírgula"
                  value={formEdicao.habilidades}
                  onChange={(e) => setFormEdicao((f) => ({ ...f, habilidades: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setDialogEditarOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={salvarEdicao}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


