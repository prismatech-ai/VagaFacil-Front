// Copied from old admin vagas page
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Trash2, Search, Briefcase, Building2, MapPin, Plus } from "lucide-react"
import { mockUsers, mockVagas, mockCandidaturas } from "@/lib/mock-data"
import type { Vaga, Candidatura } from "@/lib/types"
import { Textarea } from "@/components/ui/textarea"

export default function AdminVagasPage() {
  const [vagas, setVagas] = useState<Vaga[]>(mockVagas.map((v) => ({ ...v })))
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<"" | "aberta" | "fechada">("")
  const [empresaFiltro, setEmpresaFiltro] = useState<string>("")
  const [periodoFiltro, setPeriodoFiltro] = useState<"" | "7" | "30">("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [empresaIdForm, setEmpresaIdForm] = useState<string>("")
  const [usuarioIdForm, setUsuarioIdForm] = useState<string>("")
  const [tituloForm, setTituloForm] = useState("")
  const [descricaoForm, setDescricaoForm] = useState("")
  const [requisitosForm, setRequisitosForm] = useState("")
  const [localizacaoForm, setLocalizacaoForm] = useState("")
  const [tipoForm, setTipoForm] = useState<"CLT" | "PJ" | "Estágio" | "Temporário">("CLT")

  const empresas = useMemo(
    () => mockUsers.filter((u) => u.role === "empresa"),
    []
  )

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      aberta: "default",
      fechada: "secondary",
    }
    return variants[status] || "outline"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      aberta: "Aberta",
      fechada: "Fechada",
    }
    return labels[status] || status
  }

  const candidaturasPorVaga = useMemo(() => {
    const map: Record<string, Candidatura[]> = {}
    vagas.forEach((v) => {
      map[v.id] = mockCandidaturas.filter((c) => c.vagaId === v.id)
    })
    return map
  }, [vagas])

  const vagasFiltradas = useMemo(() => {
    const now = new Date()
    const dias = periodoFiltro ? parseInt(periodoFiltro, 10) : 0
    const cutoff = dias ? new Date(now.getTime() - dias * 24 * 60 * 60 * 1000) : null
    const buscaLower = busca.trim().toLowerCase()
    return vagas.filter((v) => {
      const matchBusca =
        !buscaLower ||
        v.titulo.toLowerCase().includes(buscaLower) ||
        v.descricao.toLowerCase().includes(buscaLower) ||
        v.requisitos.toLowerCase().includes(buscaLower)
      const matchStatus = !statusFiltro || v.status === statusFiltro
      const matchEmpresa = !empresaFiltro || v.empresaId === empresaFiltro
      const matchPeriodo = !cutoff || v.createdAt >= cutoff
      return matchBusca && matchStatus && matchEmpresa && matchPeriodo
    })
  }, [vagas, busca, statusFiltro, empresaFiltro, periodoFiltro])

  const abrirDetalhes = (vaga: Vaga) => {
    setVagaSelecionada(vaga)
    setDialogOpen(true)
  }

  const removerVaga = (id: string) => {
    setVagas((prev) => prev.filter((v) => v.id !== id))
  }

  const empresaNome = (empresaId: string) => {
    const e = empresas.find((u) => u.id === empresaId)
    // @ts-ignore
    return (e?.nomeEmpresa as string) || e?.nome || "Empresa"
  }

  const contagemPorStatus = (lista: Candidatura[]) => {
    return lista.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    }, {})
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Gestão de Vagas</h2>
          <p className="text-muted-foreground">Tabela geral com filtros e detalhes</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Vaga
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre por empresa, status, período e busca</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Título, descrição ou requisitos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Select value={empresaFiltro} onValueChange={(v) => setEmpresaFiltro(v === "all" ? "" : v)}>
                <SelectTrigger id="empresa">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {empresas.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {/* @ts-ignore */}
                      {e.nomeEmpresa as string || e.nome}
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
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="fechada">Fechada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodo">Período</Label>
              <Select value={periodoFiltro} onValueChange={(v) => setPeriodoFiltro((v === "all" ? "" : v) as any)}>
                <SelectTrigger id="periodo">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Criar Vaga */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nova Vaga</DialogTitle>
            <DialogDescription>Selecione a empresa e preencha as informações da vaga</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Select value={empresaIdForm} onValueChange={(v) => { setEmpresaIdForm(v); if (!usuarioIdForm) setUsuarioIdForm(v) }}>
                  <SelectTrigger id="empresa">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>
                        {(e.nomeEmpresa as string) || e.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuário Responsável</Label>
                <Select value={usuarioIdForm} onValueChange={setUsuarioIdForm}>
                  <SelectTrigger id="usuario">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nome} ({e.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" value={tituloForm} onChange={(e) => setTituloForm(e.target.value)} placeholder="Ex: Técnico em Manutenção" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="local">Localização</Label>
                <Input id="local" value={localizacaoForm} onChange={(e) => setLocalizacaoForm(e.target.value)} placeholder="Ex: São Paulo - SP" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Contrato</Label>
                <Select value={tipoForm} onValueChange={(v) => setTipoForm(v as any)}>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Estágio">Estágio</SelectItem>
                    <SelectItem value="Temporário">Temporário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" rows={4} value={descricaoForm} onChange={(e) => setDescricaoForm(e.target.value)} placeholder="Descreva as responsabilidades e contexto da vaga..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requisitos">Requisitos</Label>
              <Textarea id="requisitos" rows={3} value={requisitosForm} onChange={(e) => setRequisitosForm(e.target.value)} placeholder="Liste os requisitos necessários..." />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={!empresaIdForm || !tituloForm.trim() || !localizacaoForm.trim() || !descricaoForm.trim() || !requisitosForm.trim()}
                onClick={() => {
                  const novaVaga: Vaga = {
                    id: Date.now().toString(),
                    empresaId: empresaIdForm,
                    titulo: tituloForm,
                    descricao: descricaoForm,
                    requisitos: requisitosForm,
                    localizacao: localizacaoForm,
                    tipo: tipoForm,
                    status: "aberta",
                    createdAt: new Date(),
                  }
                  setVagas((prev) => [novaVaga, ...prev])
                  mockVagas.push(novaVaga)
                  setCreateOpen(false)
                  setEmpresaIdForm("")
                  setUsuarioIdForm("")
                  setTituloForm("")
                  setDescricaoForm("")
                  setRequisitosForm("")
                  setLocalizacaoForm("")
                  setTipoForm("CLT")
                }}
              >
                Registrar Vaga
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabela de Vagas */}
      <Card>
        <CardHeader>
          <CardTitle>Vagas</CardTitle>
          <CardDescription>{vagasFiltradas.length} resultados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Candidaturas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vagasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhuma vaga encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  vagasFiltradas.map((vaga) => {
                    const totalCands = candidaturasPorVaga[vaga.id]?.length ?? 0
                    return (
                      <TableRow key={vaga.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{vaga.titulo}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {empresaNome(vaga.empresaId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {vaga.localizacao}
                          </div>
                        </TableCell>
                        <TableCell>{vaga.tipo}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(vaga.status)}>{getStatusLabel(vaga.status)}</Badge>
                        </TableCell>
                        <TableCell>{totalCands}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => abrirDetalhes(vaga)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removerVaga(vaga.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Detalhes da Vaga */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Vaga</DialogTitle>
            <DialogDescription>
              {vagaSelecionada?.titulo} • {vagaSelecionada && empresaNome(vagaSelecionada.empresaId)}
            </DialogDescription>
          </DialogHeader>
          {vagaSelecionada && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações</CardTitle>
                    <CardDescription>Dados principais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><span className="font-medium">Localização:</span> {vagaSelecionada.localizacao}</div>
                    <div><span className="font-medium">Tipo:</span> {vagaSelecionada.tipo}</div>
                    {vagaSelecionada.salario && (
                      <div><span className="font-medium">Faixa salarial:</span> {vagaSelecionada.salario}</div>
                    )}
                    {vagaSelecionada.nivel && (
                      <div><span className="font-medium">Nível:</span> {vagaSelecionada.nivel}</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Métricas</CardTitle>
                    <CardDescription>Resumo das candidaturas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {(() => {
                      const lista = candidaturasPorVaga[vagaSelecionada.id] ?? []
                      const cont = contagemPorStatus(lista)
                      const total = lista.length
                      return (
                        <>
                          <div><span className="font-medium">Total:</span> {total}</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(cont).map(([k, v]) => (
                              <Badge key={k} variant="outline">{k.replace("_", " ")}: {v}</Badge>
                            ))}
                            {total === 0 && <span className="text-muted-foreground">Sem candidaturas</span>}
                          </div>
                        </>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{vagaSelecionada.descricao}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Requisitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{vagaSelecionada.requisitos}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Candidatos</CardTitle>
                  <CardDescription>Lista dos candidatos aplicados</CardDescription>
                </CardHeader>
                <CardContent className="rounded-md border p-0 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidato</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mensagem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(candidaturasPorVaga[vagaSelecionada.id] ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            Nenhuma candidatura
                          </TableCell>
                        </TableRow>
                      ) : (
                        (candidaturasPorVaga[vagaSelecionada.id] ?? []).map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>
                              {/* @ts-ignore */}
                              {mockUsers.find((u) => u.id === c.candidatoId)?.nome}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{c.status.replace("_", " ")}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[420px]">
                              <span className="line-clamp-2">{c.mensagem || "-"}</span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}


