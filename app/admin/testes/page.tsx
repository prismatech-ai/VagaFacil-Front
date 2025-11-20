// Copied from old admin testes page
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
import { Search, Eye, Pencil, Trash2, FileText } from "lucide-react"
import type { Teste, Questao } from "@/lib/types"

export default function AdminTestesPage() {
  const [testes, setTestes] = useState<Teste[]>([])
  const [busca, setBusca] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState<"" | "padronizado" | "dinamico">("")

  const [dialogCriarEditarOpen, setDialogCriarEditarOpen] = useState(false)
  const [dialogVerOpen, setDialogVerOpen] = useState(false)
  const [modoEdicao, setModoEdicao] = useState<"create" | "edit">("create")
  const [testeSelecionado, setTesteSelecionado] = useState<Teste | null>(null)

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    tipo: "" as "" | "padronizado" | "dinamico",
    perguntas: [] as { id: string; pergunta: string; nivel: "Básico" | "Intermediário" | "Avançado" }[],
  })

  const testesFiltrados = useMemo(() => {
    const search = busca.trim().toLowerCase()
    return testes.filter((t) => {
      const matchBusca =
        !search ||
        t.titulo.toLowerCase().includes(search) ||
        (t.descricao?.toLowerCase().includes(search) ?? false)
      const matchTipo = !tipoFiltro || t.tipo === tipoFiltro
      return matchBusca && matchTipo
    })
  }, [testes, busca, tipoFiltro])

  const abrirCriar = () => {
    setModoEdicao("create")
    setTesteSelecionado(null)
    setForm({
      titulo: "",
      descricao: "",
      tipo: "",
      perguntas: [],
    })
    setDialogCriarEditarOpen(true)
  }

  const abrirEditar = (t: Teste) => {
    setModoEdicao("edit")
    setTesteSelecionado(t)
    setForm({
      titulo: t.titulo,
      descricao: t.descricao ?? "",
      tipo: t.tipo,
      perguntas: (t.questoes ?? []).map((q) => ({
        id: q.id,
        pergunta: q.pergunta,
        nivel:
          q.nivelDificuldade === "facil"
            ? "Básico"
            : q.nivelDificuldade === "medio"
            ? "Intermediário"
            : "Avançado",
      })),
    })
    setDialogCriarEditarOpen(true)
  }

  const abrirVer = (t: Teste) => {
    setTesteSelecionado(t)
    setDialogVerOpen(true)
  }

  const addPergunta = () => {
    setForm((f) => ({
      ...f,
      perguntas: [
        ...f.perguntas,
        { id: `${Date.now()}-${f.perguntas.length}`, pergunta: "", nivel: "Básico" },
      ],
    }))
  }

  const removePergunta = (id: string) => {
    setForm((f) => ({ ...f, perguntas: f.perguntas.filter((p) => p.id !== id) }))
  }

  const salvar = () => {
    if (!form.titulo || !form.tipo) return
    const questoesSelecionadas: Questao[] = form.perguntas
      .filter((p) => p.pergunta.trim())
      .map((p, idx) => ({
        id: p.id || `q-${Date.now()}-${idx}`,
        pergunta: p.pergunta.trim(),
        tipo: "multipla_escolha",
        opcoes: [],
        respostaCorreta: 0,
        nivelDificuldade:
          p.nivel === "Básico" ? "facil" : p.nivel === "Intermediário" ? "medio" : "dificil",
      }))

    if (modoEdicao === "create") {
      const novo: Teste = {
        id: Date.now().toString(),
        titulo: form.titulo,
        descricao: form.descricao || undefined,
        tipo: form.tipo,
        questoes: questoesSelecionadas,
        createdAt: new Date(),
      }
      setTestes((prev) => [novo, ...prev])
    } else if (testeSelecionado) {
      setTestes((prev) =>
        prev.map((t) =>
          t.id === testeSelecionado.id
            ? {
                ...t,
                titulo: form.titulo,
                descricao: form.descricao || undefined,
                tipo: form.tipo,
                questoes: questoesSelecionadas,
              }
            : t
        )
      )
    }
    setDialogCriarEditarOpen(false)
  }

  const remover = (id: string) => {
    setTestes((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Gestão de Testes</h2>
          <p className="text-muted-foreground">Listagem, criação e edição de testes padronizados ou dinâmicos</p>
        </div>
        <Button onClick={abrirCriar}>
          <FileText className="h-4 w-4 mr-2" />
          Novo Teste
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque por título/descrição e filtre por tipo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Título ou palavras da descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipoFiltro} onValueChange={(v) => setTipoFiltro((v === "all" ? "" : (v as any)))}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="padronizado">Padronizado</SelectItem>
                  <SelectItem value="dinamico">Dinâmico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Testes</CardTitle>
          <CardDescription>{testesFiltrados.length} resultados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Questões</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum teste cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  testesFiltrados.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.titulo}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.tipo === "padronizado" ? "Padronizado" : "Dinâmico"}</Badge>
                      </TableCell>
                      <TableCell>{t.questoes?.length ?? 0}</TableCell>
                      <TableCell>{t.createdAt.toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => abrirVer(t)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => abrirEditar(t)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => remover(t.id)}>
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

      {/* Dialog Criar/Editar */}
      <Dialog open={dialogCriarEditarOpen} onOpenChange={setDialogCriarEditarOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{modoEdicao === "create" ? "Novo Teste" : "Editar Teste"}</DialogTitle>
            <DialogDescription>Defina título, tipo e adicione perguntas com nível de dificuldade</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as any }))}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="padronizado">Padronizado</SelectItem>
                  <SelectItem value="dinamico">Dinâmico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Perguntas</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPergunta}>
                + Adicionar pergunta
              </Button>
            </div>
            {form.perguntas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma pergunta adicionada</p>
            ) : (
              <div className="space-y-3">
                {form.perguntas.map((p, idx) => (
                  <div key={p.id} className="grid md:grid-cols-12 gap-2 items-start">
                    <div className="md:col-span-9 space-y-1">
                      <Label className="text-xs">Pergunta {idx + 1}</Label>
                      <Input
                        value={p.pergunta}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            perguntas: f.perguntas.map((pp) =>
                              pp.id === p.id ? { ...pp, pergunta: e.target.value } : pp
                            ),
                          }))
                        }
                        placeholder="Escreva a pergunta..."
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-xs">Nível</Label>
                      <Select
                        value={p.nivel}
                        onValueChange={(v: any) =>
                          setForm((f) => ({
                            ...f,
                            perguntas: f.perguntas.map((pp) =>
                              pp.id === p.id ? { ...pp, nivel: v } : pp
                            ),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Básico">Básico</SelectItem>
                          <SelectItem value="Intermediário">Intermediário</SelectItem>
                          <SelectItem value="Avançado">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button variant="ghost" type="button" onClick={() => removePergunta(p.id)}>
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setDialogCriarEditarOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={salvar}>
              {modoEdicao === "create" ? "Criar" : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver */}
      <Dialog open={dialogVerOpen} onOpenChange={setDialogVerOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Teste</DialogTitle>
            <DialogDescription>
              {testeSelecionado?.titulo} • {testeSelecionado?.tipo === "padronizado" ? "Padronizado" : "Dinâmico"}
            </DialogDescription>
          </DialogHeader>
          {testeSelecionado && (
            <div className="space-y-6">
              {testeSelecionado.descricao && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Descrição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{testeSelecionado.descricao}</p>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Questões</CardTitle>
                  <CardDescription>Total: {testeSelecionado.questoes?.length ?? 0}</CardDescription>
                </CardHeader>
                <CardContent className="rounded-md border p-0 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Pergunta</TableHead>
                        <TableHead>Dificuldade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(testeSelecionado.questoes ?? []).map((q, idx) => (
                        <TableRow key={q.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="max-w-[520px]">
                            <span className="line-clamp-2">{q.pergunta}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{q.nivelDificuldade}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(testeSelecionado.questoes ?? []).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            Sem questões
                          </TableCell>
                        </TableRow>
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


