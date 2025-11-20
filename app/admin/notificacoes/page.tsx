// Copied from old admin notificacoes page
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Send, Users, Building2, Bell } from "lucide-react"
import { mockUsers } from "@/lib/mock-data"
import type { User, Empresa, Candidato } from "@/lib/types"

type Audience = "todos" | "empresas" | "candidatos" | "especificos"

type Notificacao = {
  id: string
  titulo: string
  mensagem: string
  audience: Audience
  destinatarios: string[] // user ids
  createdAt: Date
}

export default function AdminNotificacoesPage() {
  const [titulo, setTitulo] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [audience, setAudience] = useState<Audience>("todos")
  const [search, setSearch] = useState("")
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({})
  const [historico, setHistorico] = useState<Notificacao[]>([])

  const empresas = useMemo(
    () => (mockUsers.filter((u) => u.role === "empresa") as (Empresa & User)[]),
    []
  )
  const candidatos = useMemo(
    () => (mockUsers.filter((u) => u.role === "candidato") as (Candidato & User)[]),
    []
  )

  const usuariosListados = useMemo(() => {
    const todos = [...empresas, ...candidatos]
    const query = search.trim().toLowerCase()
    return todos
      .filter((u) => {
        if (audience === "empresas" && u.role !== "empresa") return false
        if (audience === "candidatos" && u.role !== "candidato") return false
        return (
          !query ||
          u.nome.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
        )
      })
      .slice(0, 50)
  }, [empresas, candidatos, audience, search])

  const toggleSelecionado = (id: string, checked: boolean | string) => {
    setSelecionados((prev) => ({ ...prev, [id]: !!checked }))
  }

  const countSelecionados = useMemo(
    () => Object.values(selecionados).filter(Boolean).length,
    [selecionados]
  )

  const destinatariosCalculados = useMemo(() => {
    if (audience === "todos") return [...empresas, ...candidatos].map((u) => u.id)
    if (audience === "empresas") return empresas.map((e) => e.id)
    if (audience === "candidatos") return candidatos.map((c) => c.id)
    // especificos
    return Object.entries(selecionados)
      .filter(([, v]) => v)
      .map(([id]) => id)
  }, [audience, empresas, candidatos, selecionados])

  const canSend =
    !!titulo.trim() &&
    !!mensagem.trim() &&
    (audience !== "especificos" || destinatariosCalculados.length > 0)

  const enviar = () => {
    if (!canSend) return
    const novo: Notificacao = {
      id: Date.now().toString(),
      titulo: titulo.trim(),
      mensagem: mensagem.trim(),
      audience,
      destinatarios: destinatariosCalculados,
      createdAt: new Date(),
    }
    setHistorico((prev) => [novo, ...prev])
    // Reset
    setTitulo("")
    setMensagem("")
    setAudience("todos")
    setSelecionados({})
    setSearch("")
  }

  const labelAudience = (a: Audience) => {
    switch (a) {
      case "todos":
        return "Todos (Empresas e Candidatos)"
      case "empresas":
        return "Empresas"
      case "candidatos":
        return "Candidatos"
      case "especificos":
        return "Usuários específicos"
    }
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Gestão de Notificações</h2>
        <p className="text-muted-foreground">
          Envie notificações para todas as empresas, todos os candidatos ou usuários específicos
        </p>
      </div>

      {/* Composer */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Novo envio</CardTitle>
          <CardDescription>Defina o público, título e mensagem</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audience">Público</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as Audience)}>
                <SelectTrigger id="audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="empresas">Empresas</SelectItem>
                  <SelectItem value="candidatos">Candidatos</SelectItem>
                  <SelectItem value="especificos">Usuários específicos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="Ex: Atualização importante"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              rows={4}
              placeholder="Escreva a mensagem a ser enviada..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
          </div>

          {audience === "especificos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Selecionar usuários</p>
                  <p className="text-xs text-muted-foreground">
                    Filtre por nome ou e-mail e marque os destinatários
                  </p>
                </div>
                <Badge variant="outline">{countSelecionados} selecionado(s)</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nome ou e-mail..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Usuários</Label>
                  <div className="max-h-60 overflow-auto rounded-md border p-3 space-y-2">
                    {usuariosListados.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center">Nenhum usuário encontrado</p>
                    ) : (
                      usuariosListados.map((u) => (
                        <label key={u.id} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {u.role === "empresa" ? (
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Users className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div className="text-sm">
                              <p className="font-medium leading-none">{u.nome}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                          <Checkbox
                            checked={!!selecionados[u.id]}
                            onCheckedChange={(c) => toggleSelecionado(u.id, c)}
                          />
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Destinatários:{" "}
              <span className="font-medium">
                {audience === "especificos" ? countSelecionados : destinatariosCalculados.length}
              </span>
            </div>
            <Button onClick={enviar} disabled={!canSend}>
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de envios</CardTitle>
          <CardDescription>Registros locais dos últimos envios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Público</TableHead>
                  <TableHead>Destinatários</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historico.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma notificação enviada ainda
                    </TableCell>
                  </TableRow>
                ) : (
                  historico.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        {n.titulo}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{labelAudience(n.audience)}</Badge>
                      </TableCell>
                      <TableCell>{n.destinatarios.length}</TableCell>
                      <TableCell className="max-w-[420px]">
                        <span className="line-clamp-2">{n.mensagem}</span>
                      </TableCell>
                      <TableCell>{n.createdAt.toLocaleString("pt-BR")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}


