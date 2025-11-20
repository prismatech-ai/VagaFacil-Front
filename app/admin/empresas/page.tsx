// Copied from old empresas page
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building2, Briefcase, ExternalLink, Globe, Pencil, Plus, Search, Trash2, Users } from "lucide-react"
import { mockUsers, mockVagas } from "@/lib/mock-data"
import type { Empresa } from "@/lib/types"

type EmpresaAcesso = {
  id: string
  nome: string
  email: string
  createdAt: Date
}

export default function AdminEmpresasPage() {
  const initialEmpresas = useMemo(
    () => (mockUsers.filter((u) => u.role === "empresa") as Empresa[]).map((e) => ({ ...e })),
    []
  )
  const [empresas, setEmpresas] = useState<Empresa[]>(initialEmpresas)
  const [filtros, setFiltros] = useState({
    busca: "",
    cnpj: "",
  })

  const [dialogVerOpen, setDialogVerOpen] = useState(false)
  const [dialogEditarOpen, setDialogEditarOpen] = useState(false)
  const [modoEdicao, setModoEdicao] = useState<"create" | "edit">("edit")
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null)

  const [formEmpresa, setFormEmpresa] = useState({
    nomeEmpresa: "",
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    site: "",
    descricao: "",
    responsavelNome: "",
    responsavelEmail: "",
  })

  // Gestão de acesso (usuários da empresa) - estado local apenas para protótipo
  const [acessosPorEmpresa, setAcessosPorEmpresa] = useState<Record<string, EmpresaAcesso[]>>(() => {
    const map: Record<string, EmpresaAcesso[]> = {}
    initialEmpresas.forEach((e) => {
      map[e.id] = [
        {
          id: `${e.id}-owner`,
          nome: e.nome,
          email: e.email,
          createdAt: e.createdAt,
        },
      ]
    })
    return map
  })
  const [novoAcesso, setNovoAcesso] = useState({ nome: "", email: "" })

  const vagasPorEmpresa = useMemo(() => {
    const counts: Record<string, number> = {}
    empresas.forEach((e) => {
      counts[e.id] = mockVagas.filter((v) => v.empresaId === e.id).length
    })
    return counts
  }, [empresas])

  const empresasFiltradas = useMemo(() => {
    const busca = filtros.busca.trim().toLowerCase()
    const cnpjBusca = filtros.cnpj.replace(/\D/g, "")
    return empresas.filter((e) => {
      const matchBusca =
        !busca ||
        e.nomeEmpresa?.toLowerCase().includes(busca) ||
        e.nome?.toLowerCase().includes(busca) ||
        e.email.toLowerCase().includes(busca) ||
        (e.descricao?.toLowerCase().includes(busca) ?? false)
      const matchCnpj = !cnpjBusca || e.cnpj.replace(/\D/g, "").includes(cnpjBusca)
      return matchBusca && matchCnpj
    })
  }, [empresas, filtros])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const abrirVer = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa)
    setDialogVerOpen(true)
  }

  const abrirCriar = () => {
    setModoEdicao("create")
    setEmpresaSelecionada(null)
    setFormEmpresa({
      nomeEmpresa: "",
      razaoSocial: "",
      nomeFantasia: "",
      cnpj: "",
      site: "",
      descricao: "",
      responsavelNome: "",
      responsavelEmail: "",
    })
    setDialogEditarOpen(true)
  }

  const abrirEditar = (empresa: Empresa) => {
    setModoEdicao("edit")
    setEmpresaSelecionada(empresa)
    setFormEmpresa({
      nomeEmpresa: empresa.nomeEmpresa ?? "",
      razaoSocial: empresa.razaoSocial ?? "",
      nomeFantasia: empresa.nomeFantasia ?? "",
      cnpj: empresa.cnpj ?? "",
      site: empresa.site ?? "",
      descricao: empresa.descricao ?? "",
      responsavelNome: empresa.nome ?? "",
      responsavelEmail: empresa.email ?? "",
    })
    setDialogEditarOpen(true)
  }

  const salvarEmpresa = () => {
    if (modoEdicao === "create") {
      const id = `${Date.now()}`
      const novaEmpresa: Empresa = {
        id,
        role: "empresa",
        email: formEmpresa.responsavelEmail || `contato@${(formEmpresa.site || "empresa").replace(/^https?:\/\//, "")}`,
        nome: formEmpresa.responsavelNome || formEmpresa.nomeEmpresa || "Responsável",
        createdAt: new Date(),
        nomeEmpresa: formEmpresa.nomeEmpresa || "Nova Empresa",
        cnpj: formEmpresa.cnpj || "00.000.000/0000-00",
        razaoSocial: formEmpresa.razaoSocial || undefined,
        nomeFantasia: formEmpresa.nomeFantasia || undefined,
        site: formEmpresa.site || undefined,
        descricao: formEmpresa.descricao || undefined,
      }
      setEmpresas((prev) => [novaEmpresa, ...prev])
      setAcessosPorEmpresa((prev) => ({
        ...prev,
        [id]: [
          {
            id: `${id}-owner`,
            nome: novaEmpresa.nome,
            email: novaEmpresa.email,
            createdAt: novaEmpresa.createdAt,
          },
        ],
      }))
    } else if (empresaSelecionada) {
      setEmpresas((prev) =>
        prev.map((e) =>
          e.id === empresaSelecionada.id
            ? {
                ...e,
                nomeEmpresa: formEmpresa.nomeEmpresa || e.nomeEmpresa,
                razaoSocial: formEmpresa.razaoSocial || undefined,
                nomeFantasia: formEmpresa.nomeFantasia || undefined,
                cnpj: formEmpresa.cnpj || e.cnpj,
                site: formEmpresa.site || undefined,
                descricao: formEmpresa.descricao || undefined,
                nome: formEmpresa.responsavelNome || e.nome,
                email: formEmpresa.responsavelEmail || e.email,
              }
            : e
        )
      )
    }
    setDialogEditarOpen(false)
  }

  const removerEmpresa = (id: string) => {
    setEmpresas((prev) => prev.filter((e) => e.id !== id))
  }

  const adicionarAcesso = () => {
    if (!empresaSelecionada || !novoAcesso.nome || !novoAcesso.email) return
    setAcessosPorEmpresa((prev) => {
      const atual = prev[empresaSelecionada.id] ?? []
      return {
        ...prev,
        [empresaSelecionada.id]: [
          ...atual,
          { id: `${empresaSelecionada.id}-${Date.now()}`, nome: novoAcesso.nome, email: novoAcesso.email, createdAt: new Date() },
        ],
      }
    })
    setNovoAcesso({ nome: "", email: "" })
  }

  const removerAcesso = (acessoId: string) => {
    if (!empresaSelecionada) return
    setAcessosPorEmpresa((prev) => {
      const atual = prev[empresaSelecionada.id] ?? []
      return {
        ...prev,
        [empresaSelecionada.id]: atual.filter((a) => a.id !== acessoId),
      }
    })
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Gestão de Empresas</h2>
          <p className="text-muted-foreground">Gerencie dados institucionais, vagas publicadas e acessos dos usuários</p>
        </div>
        <Button onClick={abrirCriar}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque por nome, e-mail, descrição ou CNPJ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Nome da empresa, responsável, email..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={filtros.cnpj}
                onChange={(e) => setFiltros({ ...filtros, cnpj: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Empresas</CardTitle>
          <CardDescription>{empresasFiltradas.length} resultados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Vagas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma empresa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  empresasFiltradas.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(e.nomeEmpresa || e.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {e.nomeEmpresa || "-"}
                              {e.site && (
                                <a
                                  href={e.site.startsWith("http") ? e.site : `https://${e.site}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  site
                                </a>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{e.descricao || "-"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium">{e.nome}</div>
                            <div className="text-xs text-muted-foreground">{e.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{e.cnpj}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{vagasPorEmpresa[e.id] ?? 0}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => abrirVer(e)}>
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => abrirEditar(e)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removerEmpresa(e.id)}>
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

      {/* Dialog: Detalhes / Acessos */}
      <Dialog open={dialogVerOpen} onOpenChange={setDialogVerOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Empresa</DialogTitle>
            <DialogDescription>
              {empresaSelecionada?.nomeEmpresa} • {empresaSelecionada?.cnpj}
            </DialogDescription>
          </DialogHeader>
          {empresaSelecionada && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados Institucionais</CardTitle>
                    <CardDescription>Informações públicas da organização</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><span className="font-medium">Razão Social:</span> {empresaSelecionada.razaoSocial || "-"}</div>
                    <div><span className="font-medium">Nome Fantasia:</span> {empresaSelecionada.nomeFantasia || "-"}</div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Site:</span>
                      {empresaSelecionada.site ? (
                        <a
                          href={empresaSelecionada.site.startsWith("http") ? empresaSelecionada.site : `https://${empresaSelecionada.site}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {empresaSelecionada.site}
                        </a>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                    {empresaSelecionada.descricao && (
                      <div className="mt-2 text-muted-foreground">{empresaSelecionada.descricao}</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resumo</CardTitle>
                    <CardDescription>Métricas rápidas</CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Vagas:</span> {vagasPorEmpresa[empresaSelecionada.id] ?? 0}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Usuários:</span> {(acessosPorEmpresa[empresaSelecionada.id] ?? []).length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Usuários da Conta</CardTitle>
                  <CardDescription>Gerencie o acesso dos usuários da empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="novo-nome">Nome</Label>
                      <Input
                        id="novo-nome"
                        value={novoAcesso.nome}
                        onChange={(e) => setNovoAcesso((n) => ({ ...n, nome: e.target.value }))}
                        placeholder="Nome do usuário"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="novo-email">Email</Label>
                      <div className="flex gap-2">
                        <Input
                          id="novo-email"
                          type="email"
                          value={novoAcesso.email}
                          onChange={(e) => setNovoAcesso((n) => ({ ...n, email: e.target.value }))}
                          placeholder="email@empresa.com"
                        />
                        <Button type="button" onClick={adicionarAcesso}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(acessosPorEmpresa[empresaSelecionada.id] ?? []).map((a) => (
                          <TableRow key={a.id}>
                            <TableCell>{a.nome}</TableCell>
                            <TableCell>{a.email}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => removerAcesso(a.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(acessosPorEmpresa[empresaSelecionada.id] ?? []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              Nenhum usuário adicionado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Criar/Editar Empresa */}
      <Dialog open={dialogEditarOpen} onOpenChange={setDialogEditarOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{modoEdicao === "create" ? "Nova Empresa" : "Editar Empresa"}</DialogTitle>
            <DialogDescription>
              {modoEdicao === "create"
                ? "Preencha as informações para cadastrar uma nova empresa"
                : "Atualize os dados institucionais e do responsável"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
              <Input
                id="nomeEmpresa"
                value={formEmpresa.nomeEmpresa}
                onChange={(e) => setFormEmpresa((f) => ({ ...f, nomeEmpresa: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={formEmpresa.cnpj} onChange={(e) => setFormEmpresa((f) => ({ ...f, cnpj: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="razao">Razão Social</Label>
              <Input id="razao" value={formEmpresa.razaoSocial} onChange={(e) => setFormEmpresa((f) => ({ ...f, razaoSocial: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fantasia">Nome Fantasia</Label>
              <Input id="fantasia" value={formEmpresa.nomeFantasia} onChange={(e) => setFormEmpresa((f) => ({ ...f, nomeFantasia: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site">Site</Label>
              <Input id="site" value={formEmpresa.site} onChange={(e) => setFormEmpresa((f) => ({ ...f, site: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" value={formEmpresa.descricao} onChange={(e) => setFormEmpresa((f) => ({ ...f, descricao: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resp-nome">Responsável (Nome)</Label>
              <Input id="resp-nome" value={formEmpresa.responsavelNome} onChange={(e) => setFormEmpresa((f) => ({ ...f, responsavelNome: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resp-email">Responsável (Email)</Label>
              <Input id="resp-email" type="email" value={formEmpresa.responsavelEmail} onChange={(e) => setFormEmpresa((f) => ({ ...f, responsavelEmail: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setDialogEditarOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={salvarEmpresa}>
              {modoEdicao === "create" ? "Criar" : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


