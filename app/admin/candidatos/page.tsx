// Copied from old candidatos page
"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, Pencil, Search, Trash2, MapPin, LinkIcon, Mail, Filter, Award } from "lucide-react"
import type { Candidato } from "@/lib/types"
import { Slider } from "@/components/ui/slider"

export default function AdminCandidatosPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({
    busca: "",
    localizacao: "",
    habilidade: "",
    anosExperienciaMin: 0,
    anosExperienciaMax: 20,
  })

  const [dialogVerOpen, setDialogVerOpen] = useState(false)
  const [dialogEditarOpen, setDialogEditarOpen] = useState(false)
  const [conviteDialogOpen, setConviteDialogOpen] = useState(false)
  const [emailConvite, setEmailConvite] = useState("")
  const [nomeConvite, setNomeConvite] = useState("")
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<Candidato | null>(null)
  const [formEdicao, setFormEdicao] = useState({
    nome: "",
    email: "",
    telefone: "",
    localizacao: "",
    linkedin: "",
    habilidades: "",
    anosExperiencia: 0,
  })

  useEffect(() => {
    fetchCandidatos()
  }, [])

  const fetchCandidatos = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (typeof window === 'undefined') {
        console.warn('localStorage não disponível no servidor')
        return
      }
      
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.warn('Token não encontrado no localStorage')
        setError('Token não encontrado. Faça login novamente.')
        setLoading(false)
        return
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/candidatos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      console.log('GET /api/v1/admin/candidatos', { Authorization: `Bearer ${token?.slice(0, 20)}...` })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Falha ao carregar candidatos`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta inválida do servidor (não é JSON)')
      }

      const data = await response.json()
      console.log('Dados recebidos:', data)
      const candidatosArray = Array.isArray(data) ? data : (data.candidatos || data.usuarios || data.data || [])
      console.log('Candidatos processados:', candidatosArray)
      setCandidatos(candidatosArray)
      setLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar candidatos'
      setError(errorMessage)
      setCandidatos([])
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "?"
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
      const matchHab = !hab || (c.habilidades?.some((h) => h.toLowerCase().includes(hab)) ?? false)
      const matchAnosExp =
        (c.anosExperiencia ?? 0) >= filtros.anosExperienciaMin && (c.anosExperiencia ?? 0) <= filtros.anosExperienciaMax
      return matchBusca && matchLocal && matchHab && matchAnosExp
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
      habilidades: Array.isArray(cand.habilidades) ? cand.habilidades.join(", ") : (typeof cand.habilidades === 'string' ? cand.habilidades : ""),
      anosExperiencia: cand.anosExperiencia ?? 0,
    })
    setDialogEditarOpen(true)
  }

  const salvarEdicao = () => {
    if (!candidatoSelecionado) return
    const habilidades = (formEdicao.habilidades ?? "")
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
              anosExperiencia: formEdicao.anosExperiencia,
            }
          : c,
      ),
    )
    setDialogEditarOpen(false)
  }

  const removerCandidato = (id: string) => {
    setCandidatos((prev) => prev.filter((c) => c.id !== id))
  }

  const enviarConvite = () => {
    if (!emailConvite.trim()) return
    // Mock: Send invitation email with onboarding link
    console.log(`[v0] Convite enviado para ${emailConvite} (Nome: ${nomeConvite || "Não informado"})`)
    console.log(`[v0] Email incluirá link para cadastro básico, experiência, currículo, autoavaliação e testes`)

    // Reset form
    setEmailConvite("")
    setNomeConvite("")
    setConviteDialogOpen(false)
  }

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      localizacao: "",
      habilidade: "",
      anosExperienciaMin: 0,
      anosExperienciaMax: 20,
    })
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Gestão de Candidatos</h2>
          <p className="text-muted-foreground">
            Lista completa de candidatos com filtros avançados e ações administrativas
          </p>
        </div>
        <Button onClick={() => setConviteDialogOpen(true)}>
          <Mail className="h-4 w-4 mr-2" />
          Convidar Candidato
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtros Avançados</CardTitle>
              <CardDescription>Busque e filtre candidatos por características específicas</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={limparFiltros}>
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

          <div className="space-y-2">
            <Label>
              Anos de Experiência: {filtros.anosExperienciaMin} - {filtros.anosExperienciaMax} anos
            </Label>
            <div className="flex gap-4 items-center">
              <span className="text-sm text-muted-foreground w-8">0</span>
              <Slider
                min={0}
                max={20}
                step={1}
                value={[filtros.anosExperienciaMin, filtros.anosExperienciaMax]}
                onValueChange={(values) =>
                  setFiltros({ ...filtros, anosExperienciaMin: values[0], anosExperienciaMax: values[1] })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-8">20+</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={conviteDialogOpen} onOpenChange={setConviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar Candidato</DialogTitle>
            <DialogDescription>
              Informe os dados do candidato. Ele receberá um email com link para completar o cadastro incluindo: dados
              básicos, experiências, currículo, autoavaliação e testes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome-convite">Nome do candidato (opcional)</Label>
              <Input
                id="nome-convite"
                type="text"
                placeholder="João Silva"
                value={nomeConvite}
                onChange={(e) => setNomeConvite(e.target.value)}
              />
            </div>
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

            <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
              <p className="font-medium">O candidato terá acesso a:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Cadastro básico de dados pessoais</li>
                <li>Experiências profissionais e currículo</li>
                <li>Autoavaliação de habilidades</li>
                <li>Testes de competência (após login)</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setConviteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" disabled={!emailConvite.trim()} onClick={enviarConvite}>
                <Mail className="h-4 w-4 mr-2" />
                Enviar Convite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Candidatos</CardTitle>
          <CardDescription>{candidatosFiltrados.length} resultados encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Experiência</TableHead>
                  <TableHead>Habilidades</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Carregando candidatos...
                    </TableCell>
                  </TableRow>
                ) : candidatosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum candidato encontrado com os filtros aplicados
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
                            {c.telefone && <div className="text-xs text-muted-foreground">{c.telefone}</div>}
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
                        <div className="flex items-center gap-2 text-sm">
                          {c.anosExperiencia ? (
                            <>
                              <Award className="h-4 w-4 text-muted-foreground" />
                              {c.anosExperiencia} anos
                            </>
                          ) : (
                            "-"
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-wrap gap-1 max-w-[360px]">
                          {(c.habilidades ?? []).slice(0, 3).map((h) => (
                            <Badge key={h} variant="outline" className="text-xs">
                              {h}
                            </Badge>
                          ))}
                          {(c.habilidades?.length ?? 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(c.habilidades?.length ?? 0) - 3}
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
                          <Button variant="ghost" size="sm" onClick={() => removerCandidato(c.id)}>
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

      <Dialog open={dialogVerOpen} onOpenChange={setDialogVerOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Perfil do Candidato</DialogTitle>
            <DialogDescription>
              {candidatoSelecionado?.nome} - {candidatoSelecionado?.email}
            </DialogDescription>
          </DialogHeader>
          {candidatoSelecionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
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
                    {candidatoSelecionado.anosExperiencia !== undefined && (
                      <p>
                        <span className="font-medium">Experiência:</span> {candidatoSelecionado.anosExperiencia} anos
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cadastro completo:</span>
                      <Badge variant="outline">Sim</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Currículo enviado:</span>
                      <Badge variant="outline">{candidatoSelecionado.curriculo ? "Sim" : "Não"}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Testes realizados:</span>
                      <Badge variant="outline">{candidatoSelecionado.testesRealizados?.length ?? 0}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {candidatoSelecionado.curriculo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resumo Profissional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{candidatoSelecionado.curriculo}</p>
                  </CardContent>
                </Card>
              )}

              {candidatoSelecionado.habilidades && candidatoSelecionado.habilidades.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Habilidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidatoSelecionado.habilidades.map((habilidade) => (
                        <Badge key={habilidade} variant="secondary">
                          {habilidade}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {candidatoSelecionado.educacao && candidatoSelecionado.educacao.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Formação Acadêmica</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {candidatoSelecionado.educacao.map((edu) => (
                        <div key={edu.id} className="p-3 border rounded-lg">
                          <p className="font-medium">{edu.curso}</p>
                          <p className="text-sm text-muted-foreground">{edu.instituicao}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {edu.nivel}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {edu.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {candidatoSelecionado.experiencias && candidatoSelecionado.experiencias.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Experiência Profissional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {candidatoSelecionado.experiencias.map((exp) => (
                        <div key={exp.id} className="p-3 border rounded-lg">
                          <p className="font-medium">{exp.cargo}</p>
                          <p className="text-sm text-muted-foreground">{exp.empresa}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {exp.dataInicio.toLocaleDateString("pt-BR")} -{" "}
                            {exp.atual ? "Atual" : exp.dataFim?.toLocaleDateString("pt-BR")}
                          </p>
                          {exp.descricao && <p className="text-sm mt-2">{exp.descricao}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
                <Label htmlFor="anosExperiencia">Anos de Experiência</Label>
                <Input
                  id="anosExperiencia"
                  type="number"
                  min="0"
                  value={formEdicao.anosExperiencia}
                  onChange={(e) =>
                    setFormEdicao((f) => ({ ...f, anosExperiencia: Number.parseInt(e.target.value) || 0 }))
                  }
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
