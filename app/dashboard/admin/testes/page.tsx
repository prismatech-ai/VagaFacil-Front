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
import { mockQuestoes } from "@/lib/mock-data"

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
    qtdFacil: "2",
    qtdMedio: "2",
    qtdDificil: "1",
  })

  const questoesPorNivel = useMemo(() => {
    return {
      facil: mockQuestoes.filter((q) => q.nivelDificuldade === "facil"),
      medio: mockQuestoes.filter((q) => q.nivelDificuldade === "medio"),
      dificil: mockQuestoes.filter((q) => q.nivelDificuldade === "dificil"),
    }
  }, [])

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
      qtdFacil: "2",
      qtdMedio: "2",
      qtdDificil: "1",
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
      qtdFacil: String(t.questoes?.filter((q) => q.nivelDificuldade === "facil").length ?? 0),
      qtdMedio: String(t.questoes?.filter((q) => q.nivelDificuldade === "medio").length ?? 0),
      qtdDificil: String(t.questoes?.filter((q) => q.nivelDificuldade === "dificil").length ?? 0),
    })
    setDialogCriarEditarOpen(true)
  }

  const abrirVer = (t: Teste) => {
    setTesteSelecionado(t)
    setDialogVerOpen(true)
  }

  const amostrar = (array: Questao[], quantidade: number) => {
    const copia = [...array]
    const resultado: Questao[] = []
    while (resultado.length < quantidade && copia.length > 0) {
      const idx = Math.floor(Math.random() * copia.length)
      resultado.push(copia[idx])
      copia.splice(idx, 1)
    }
    return resultado
  }

  const salvar = () => {
    if (!form.titulo || !form.tipo) return
    const qtdFacil = Math.max(0, parseInt(form.qtdFacil || "0", 10))
    const qtdMedio = Math.max(0, parseInt(form.qtdMedio || "0", 10))
    const qtdDificil = Math.max(0, parseInt(form.qtdDificil || "0", 10))

    const questoesSelecionadas: Questao[] = [
      ...amostrar(questoesPorNivel.facil, qtdFacil),
      ...amostrar(questoesPorNivel.medio, qtdMedio),
      ...amostrar(questoesPorNivel.dificil, qtdDificil),
    ]

    if (modoEdicao === "create") {
      const novo: Teste = {
        id: Date.now().toString(),
        titulo: form.titulo,
        descricao: form.descricao || undefined,
        tipo: form.tipo,
        nivelDificuldade: undefined,
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
            <DialogDescription>Defina título, tipo e quantidades por dificuldade</DialogDescription>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facil">Fácil</Label>
              <Input
                id="facil"
                type="number"
                min={0}
                value={form.qtdFacil}
                onChange={(e) => setForm((f) => ({ ...f, qtdFacil: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medio">Médio</Label>
              <Input
                id="medio"
                type="number"
                min={0}
                value={form.qtdMedio}
                onChange={(e) => setForm((f) => ({ ...f, qtdMedio: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dificil">Difícil</Label>
              <Input
                id="dificil"
                type="number"
                min={0}
                value={form.qtdDificil}
                onChange={(e) => setForm((f) => ({ ...f, qtdDificil: e.target.value }))}
              />
            </div>
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


