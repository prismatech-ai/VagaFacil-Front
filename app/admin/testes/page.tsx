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
import { Search, Eye, Pencil, Trash2, Plus, X, GraduationCap } from "lucide-react"
import type { Teste } from "@/lib/types"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { mockTestes } from "@/lib/mock-data"

export default function AdminTestesPage() {
  const [testes, setTestes] = useState<Teste[]>(mockTestes)
  const [busca, setBusca] = useState("")
  const [nivelFiltro, setNivelFiltro] = useState<"" | "1" | "2" | "3" | "4" | "5">("")
  const [habilidadeFiltro, setHabilidadeFiltro] = useState("")

  const [dialogCriarEditarOpen, setDialogCriarEditarOpen] = useState(false)
  const [dialogVerOpen, setDialogVerOpen] = useState(false)
  const [modoEdicao, setModoEdicao] = useState<"create" | "edit">("create")
  const [testeSelecionado, setTesteSelecionado] = useState<Teste | null>(null)

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    habilidade: "",
    nivel: 1 as 1 | 2 | 3 | 4 | 5,
    questoes: [] as {
      id: string
      pergunta: string
      alternativas: string[]
      respostaCorreta: number
      nivel: 1 | 2 | 3 | 4 | 5
    }[],
  })

  const habilidadesUnicas = useMemo(() => {
    const habs = new Set<string>()
    testes.forEach((t) => {
      if (t.habilidade) habs.add(t.habilidade)
    })
    return Array.from(habs).sort()
  }, [testes])

  const testesFiltrados = useMemo(() => {
    const search = busca.trim().toLowerCase()
    return testes.filter((t) => {
      const matchBusca =
        !search ||
        t.nome.toLowerCase().includes(search) ||
        (t.descricao?.toLowerCase().includes(search) ?? false) ||
        (t.habilidade?.toLowerCase().includes(search) ?? false)
      const matchNivel = !nivelFiltro || t.nivel === Number.parseInt(nivelFiltro)
      const matchHabilidade = !habilidadeFiltro || t.habilidade?.toLowerCase() === habilidadeFiltro.toLowerCase()
      return matchBusca && matchNivel && matchHabilidade
    })
  }, [testes, busca, nivelFiltro, habilidadeFiltro])

  const abrirCriar = () => {
    setModoEdicao("create")
    setTesteSelecionado(null)
    setForm({
      nome: "",
      descricao: "",
      habilidade: "",
      nivel: 1,
      questoes: [],
    })
    setDialogCriarEditarOpen(true)
  }

  const abrirEditar = (t: Teste) => {
    setModoEdicao("edit")
    setTesteSelecionado(t)
    setForm({
      nome: t.nome,
      descricao: t.descricao || "",
      habilidade: t.habilidade || "",
      nivel: t.nivel,
      questoes: t.questoes.map((q) => ({
        id: q.id,
        pergunta: q.pergunta,
        alternativas: q.alternativas,
        respostaCorreta: q.respostaCorreta,
        nivel: q.nivel,
      })),
    })
    setDialogCriarEditarOpen(true)
  }

  const abrirVer = (t: Teste) => {
    setTesteSelecionado(t)
    setDialogVerOpen(true)
  }

  const addQuestao = () => {
    setForm((f) => ({
      ...f,
      questoes: [
        ...f.questoes,
        {
          id: `${Date.now()}-${f.questoes.length}`,
          pergunta: "",
          alternativas: ["", "", "", ""],
          respostaCorreta: 0,
          nivel: f.nivel,
        },
      ],
    }))
  }

  const removeQuestao = (id: string) => {
    setForm((f) => ({ ...f, questoes: f.questoes.filter((q) => q.id !== id) }))
  }

  const updateQuestao = (id: string, updates: Partial<(typeof form.questoes)[0]>) => {
    setForm((f) => ({
      ...f,
      questoes: f.questoes.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    }))
  }

  const updateAlternativa = (questaoId: string, index: number, value: string) => {
    setForm((f) => ({
      ...f,
      questoes: f.questoes.map((q) => {
        if (q.id === questaoId) {
          const novasAlternativas = [...q.alternativas]
          novasAlternativas[index] = value
          return { ...q, alternativas: novasAlternativas }
        }
        return q
      }),
    }))
  }

  const salvar = () => {
    if (!form.nome || !form.habilidade) return

    const questoesValidas = form.questoes.filter((q) => q.pergunta.trim() && q.alternativas.every((a) => a.trim()))

    if (modoEdicao === "create") {
      const novo: Teste = {
        id: Date.now().toString(),
        nome: form.nome,
        descricao: form.descricao || "",
        nivel: form.nivel,
        habilidade: form.habilidade,
        questoes: questoesValidas,
        createdAt: new Date(),
        createdBy: "1", // Admin ID
      }
      setTestes((prev) => [novo, ...prev])
    } else if (testeSelecionado) {
      setTestes((prev) =>
        prev.map((t) =>
          t.id === testeSelecionado.id
            ? {
                ...t,
                nome: form.nome,
                descricao: form.descricao,
                nivel: form.nivel,
                habilidade: form.habilidade,
                questoes: questoesValidas,
              }
            : t,
        ),
      )
    }
    setDialogCriarEditarOpen(false)
  }

  const remover = (id: string) => {
    setTestes((prev) => prev.filter((t) => t.id !== id))
  }

  const getNivelLabel = (nivel: number) => {
    const labels: Record<number, string> = {
      1: "Iniciante",
      2: "Básico",
      3: "Intermediário",
      4: "Avançado",
      5: "Expert",
    }
    return labels[nivel] || `Nível ${nivel}`
  }

  const getNivelColor = (nivel: number) => {
    const colors: Record<number, string> = {
      1: "bg-gray-100 text-gray-700",
      2: "bg-blue-100 text-blue-700",
      3: "bg-yellow-100 text-yellow-700",
      4: "bg-orange-100 text-orange-700",
      5: "bg-red-100 text-red-700",
    }
    return colors[nivel] || "bg-gray-100 text-gray-700"
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Gestão de Testes</h2>
          <p className="text-muted-foreground">
            Crie testes com questões de múltipla escolha, níveis de dificuldade e habilidades específicas
          </p>
        </div>
        <Button onClick={abrirCriar}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Teste
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque e filtre testes por habilidade, nível e palavras-chave</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Nome, habilidade ou descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="habilidade">Habilidade</Label>
              <Select value={habilidadeFiltro} onValueChange={(v) => setHabilidadeFiltro(v === "all" ? "" : v)}>
                <SelectTrigger id="habilidade">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {habilidadesUnicas.map((hab) => (
                    <SelectItem key={hab} value={hab}>
                      {hab}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nivel">Nível</Label>
              <Select value={nivelFiltro} onValueChange={(v) => setNivelFiltro(v === "all" ? "" : (v as any))}>
                <SelectTrigger id="nivel">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">Nível 1 - Iniciante</SelectItem>
                  <SelectItem value="2">Nível 2 - Básico</SelectItem>
                  <SelectItem value="3">Nível 3 - Intermediário</SelectItem>
                  <SelectItem value="4">Nível 4 - Avançado</SelectItem>
                  <SelectItem value="5">Nível 5 - Expert</SelectItem>
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Habilidade</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Questões</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum teste cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  testesFiltrados.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          {t.nome}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.habilidade}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getNivelColor(t.nivel)}>{getNivelLabel(t.nivel)}</Badge>
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

      <Dialog open={dialogCriarEditarOpen} onOpenChange={setDialogCriarEditarOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modoEdicao === "create" ? "Novo Teste" : "Editar Teste"}</DialogTitle>
            <DialogDescription>Preencha as informações do teste e adicione questões com alternativas</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Teste</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: React Avançado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="habilidade-form">Habilidade</Label>
                <Input
                  id="habilidade-form"
                  value={form.habilidade}
                  onChange={(e) => setForm((f) => ({ ...f, habilidade: e.target.value }))}
                  placeholder="Ex: React, Python, JavaScript"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nivel-form">Nível</Label>
                <Select
                  value={form.nivel.toString()}
                  onValueChange={(v) => setForm((f) => ({ ...f, nivel: Number.parseInt(v) as any }))}
                >
                  <SelectTrigger id="nivel-form">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Nível 1 - Iniciante</SelectItem>
                    <SelectItem value="2">Nível 2 - Básico</SelectItem>
                    <SelectItem value="3">Nível 3 - Intermediário</SelectItem>
                    <SelectItem value="4">Nível 4 - Avançado</SelectItem>
                    <SelectItem value="5">Nível 5 - Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  placeholder="Descreva o objetivo e conteúdo do teste..."
                  rows={2}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Questões</Label>
                <Button type="button" onClick={addQuestao} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Questão
                </Button>
              </div>

              {form.questoes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg">
                  Nenhuma questão adicionada. Clique em "Adicionar Questão" para começar.
                </p>
              ) : (
                <div className="space-y-6">
                  {form.questoes.map((q, idx) => (
                    <Card key={q.id}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">Questão {idx + 1}</CardTitle>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestao(q.id)}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`pergunta-${q.id}`}>Pergunta</Label>
                          <Textarea
                            id={`pergunta-${q.id}`}
                            value={q.pergunta}
                            onChange={(e) => updateQuestao(q.id, { pergunta: e.target.value })}
                            placeholder="Escreva a pergunta..."
                            rows={2}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label>Alternativas</Label>
                          <RadioGroup
                            value={q.respostaCorreta.toString()}
                            onValueChange={(v) => updateQuestao(q.id, { respostaCorreta: Number.parseInt(v) })}
                          >
                            {q.alternativas.map((alt, altIdx) => (
                              <div key={altIdx} className="flex items-center gap-3">
                                <RadioGroupItem value={altIdx.toString()} id={`${q.id}-alt-${altIdx}`} />
                                <div className="flex-1">
                                  <Input
                                    value={alt}
                                    onChange={(e) => updateAlternativa(q.id, altIdx, e.target.value)}
                                    placeholder={`Alternativa ${String.fromCharCode(65 + altIdx)}`}
                                  />
                                </div>
                                {q.respostaCorreta === altIdx && (
                                  <Badge variant="default" className="text-xs">
                                    Correta
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </RadioGroup>
                          <p className="text-xs text-muted-foreground">
                            Selecione a alternativa correta clicando no círculo ao lado
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`nivel-questao-${q.id}`}>Nível da Questão</Label>
                          <Select
                            value={q.nivel.toString()}
                            onValueChange={(v) => updateQuestao(q.id, { nivel: Number.parseInt(v) as any })}
                          >
                            <SelectTrigger id={`nivel-questao-${q.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Nível 1 - Iniciante</SelectItem>
                              <SelectItem value="2">Nível 2 - Básico</SelectItem>
                              <SelectItem value="3">Nível 3 - Intermediário</SelectItem>
                              <SelectItem value="4">Nível 4 - Avançado</SelectItem>
                              <SelectItem value="5">Nível 5 - Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" type="button" onClick={() => setDialogCriarEditarOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={salvar} disabled={!form.nome || !form.habilidade}>
                {modoEdicao === "create" ? "Criar Teste" : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver */}
      <Dialog open={dialogVerOpen} onOpenChange={setDialogVerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Teste</DialogTitle>
            <DialogDescription>
              {testeSelecionado?.nome} • {testeSelecionado && getNivelLabel(testeSelecionado.nivel)}
            </DialogDescription>
          </DialogHeader>
          {testeSelecionado && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Habilidade:</span> {testeSelecionado.habilidade}
                    </div>
                    <div>
                      <span className="font-medium">Nível:</span>{" "}
                      <Badge className={getNivelColor(testeSelecionado.nivel)}>
                        {getNivelLabel(testeSelecionado.nivel)}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Total de Questões:</span> {testeSelecionado.questoes?.length ?? 0}
                    </div>
                  </CardContent>
                </Card>

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
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Questões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {testeSelecionado.questoes.map((q, idx) => (
                      <div key={q.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <p className="font-medium">
                            {idx + 1}. {q.pergunta}
                          </p>
                          <Badge className={getNivelColor(q.nivel)} variant="outline">
                            {getNivelLabel(q.nivel)}
                          </Badge>
                        </div>
                        <div className="space-y-2 pl-6">
                          {q.alternativas.map((alt, altIdx) => (
                            <div
                              key={altIdx}
                              className={`p-2 rounded ${
                                q.respostaCorreta === altIdx ? "bg-green-50 border-l-2 border-green-500" : ""
                              }`}
                            >
                              <span className="font-medium mr-2">{String.fromCharCode(65 + altIdx)}.</span>
                              {alt}
                              {q.respostaCorreta === altIdx && (
                                <Badge variant="default" className="ml-2 text-xs">
                                  Correta
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
