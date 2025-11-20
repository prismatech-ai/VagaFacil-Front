// Copied from old admin suporte page
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Pencil, Trash2, PlayCircle, HelpCircle, Send, MessageSquare } from "lucide-react"
import type { TicketSuporte, RespostaTicket } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"

type VideoTutorial = { id: string; titulo: string; url: string }
type FaqItem = { id: string; pergunta: string; resposta: string }

export default function AdminSuportePage() {
  // Vídeos
  const [videos, setVideos] = useState<VideoTutorial[]>([
    { id: "v1", titulo: "Como criar um leilão", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "v2", titulo: "Aprovar pedidos", url: "https://www.youtube.com/embed/oHg5SJYRHA0" },
    { id: "v3", titulo: "Gerar relatórios", url: "https://www.youtube.com/embed/3GwjfUFyY6M" },
  ])
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [videoMode, setVideoMode] = useState<"create" | "edit">("create")
  const [videoEditId, setVideoEditId] = useState<string | null>(null)
  const [videoForm, setVideoForm] = useState({ titulo: "", url: "" })

  const abrirNovoVideo = () => {
    setVideoMode("create")
    setVideoEditId(null)
    setVideoForm({ titulo: "", url: "" })
    setVideoDialogOpen(true)
  }
  const abrirEditarVideo = (v: VideoTutorial) => {
    setVideoMode("edit")
    setVideoEditId(v.id)
    setVideoForm({ titulo: v.titulo, url: v.url })
    setVideoDialogOpen(true)
  }
  const salvarVideo = () => {
    if (!videoForm.titulo.trim() || !videoForm.url.trim()) return
    if (videoMode === "create") {
      setVideos((prev) => [{ id: Date.now().toString(), ...videoForm }, ...prev])
    } else if (videoEditId) {
      setVideos((prev) => prev.map((v) => (v.id === videoEditId ? { ...v, ...videoForm } : v)))
    }
    setVideoDialogOpen(false)
  }
  const removerVideo = (id: string) => setVideos((prev) => prev.filter((v) => v.id !== id))

  // FAQ
  const [faqs, setFaqs] = useState<FaqItem[]>([
    { id: "f1", pergunta: "Como redefinir minha senha?", resposta: "Vá em Conta > Segurança e clique em Redefinir senha." },
    { id: "f2", pergunta: "Como publicar uma vaga?", resposta: "Acesse Empresa > Vagas > Nova Vaga e preencha o formulário." },
  ])
  const [faqDialogOpen, setFaqDialogOpen] = useState(false)
  const [faqMode, setFaqMode] = useState<"create" | "edit">("create")
  const [faqEditId, setFaqEditId] = useState<string | null>(null)
  const [faqForm, setFaqForm] = useState({ pergunta: "", resposta: "" })

  const abrirNovaFaq = () => {
    setFaqMode("create")
    setFaqEditId(null)
    setFaqForm({ pergunta: "", resposta: "" })
    setFaqDialogOpen(true)
  }
  const abrirEditarFaq = (f: FaqItem) => {
    setFaqMode("edit")
    setFaqEditId(f.id)
    setFaqForm({ pergunta: f.pergunta, resposta: f.resposta })
    setFaqDialogOpen(true)
  }
  const salvarFaq = () => {
    if (!faqForm.pergunta.trim() || !faqForm.resposta.trim()) return
    if (faqMode === "create") {
      setFaqs((prev) => [{ id: Date.now().toString(), ...faqForm }, ...prev])
    } else if (faqEditId) {
      setFaqs((prev) => prev.map((f) => (f.id === faqEditId ? { ...f, ...faqForm } : f)))
    }
    setFaqDialogOpen(false)
  }
  const removerFaq = (id: string) => setFaqs((prev) => prev.filter((f) => f.id !== id))

  // Tickets
  const [tickets, setTickets] = useState<TicketSuporte[]>([
    {
      id: "t1",
      usuarioId: "2",
      assunto: "Problema ao publicar vaga",
      mensagem: "Recebo erro ao tentar publicar.",
      status: "aberto",
      prioridade: "alta",
      respostas: [
        {
          id: "r1",
          ticketId: "t1",
          usuarioId: "2",
          mensagem: "Erro ocorre ao salvar requisitos.",
          createdAt: new Date("2024-03-15T10:00:00"),
        },
      ],
      createdAt: new Date("2024-03-15T09:30:00"),
    },
    {
      id: "t2",
      usuarioId: "3",
      assunto: "Dúvida sobre testes",
      mensagem: "Como funcionam os testes dinâmicos?",
      status: "em_andamento",
      prioridade: "media",
      createdAt: new Date("2024-03-16T11:20:00"),
    },
  ])
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [ticketSelecionado, setTicketSelecionado] = useState<TicketSuporte | null>(null)
  const [respostaTexto, setRespostaTexto] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<"" | "aberto" | "em_andamento" | "resolvido" | "fechado">("")
  const [buscaTicket, setBuscaTicket] = useState("")

  const ticketsFiltrados = useMemo(() => {
    const busca = buscaTicket.trim().toLowerCase()
    return tickets.filter((t) => {
      const matchStatus = !statusFiltro || t.status === statusFiltro
      const usuario = mockUsers.find((u) => u.id === t.usuarioId)
      const matchBusca =
        !busca ||
        t.assunto.toLowerCase().includes(busca) ||
        t.mensagem.toLowerCase().includes(busca) ||
        (usuario?.nome.toLowerCase().includes(busca) ?? false)
      return matchStatus && matchBusca
    })
  }, [tickets, buscaTicket, statusFiltro])

  const abrirTicket = (t: TicketSuporte) => {
    setTicketSelecionado(t)
    setRespostaTexto("")
    setTicketDialogOpen(true)
  }

  const responderTicket = () => {
    if (!ticketSelecionado || !respostaTexto.trim()) return
    const novaResposta: RespostaTicket = {
      id: Date.now().toString(),
      ticketId: ticketSelecionado.id,
      usuarioId: "1", // admin
      mensagem: respostaTexto.trim(),
      createdAt: new Date(),
    }
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketSelecionado.id
          ? {
              ...t,
              respostas: [...(t.respostas ?? []), novaResposta],
              status: t.status === "aberto" ? "em_andamento" : t.status,
            }
          : t
      )
    )
    setRespostaTexto("")
  }

  const alterarStatusTicket = (novo: TicketSuporte["status"]) => {
    if (!ticketSelecionado) return
    setTickets((prev) => prev.map((t) => (t.id === ticketSelecionado.id ? { ...t, status: novo } : t)))
    setTicketSelecionado((t) => (t ? { ...t, status: novo } : t))
  }

  const badgeStatus = (s: TicketSuporte["status"]) => {
    const map: Record<TicketSuporte["status"], "outline" | "default" | "secondary" | "destructive"> = {
      aberto: "outline",
      em_andamento: "secondary",
      resolvido: "default",
      fechado: "destructive",
    }
    return map[s]
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Gestão de Suporte</h2>
        <p className="text-muted-foreground">Gerencie tutoriais, FAQ e tickets</p>
      </div>

      <Tabs defaultValue="videos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="videos">Tutoriais em Vídeo</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>

        {/* Vídeos */}
        <TabsContent value="videos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Vídeos de Tutoriais</CardTitle>
                <CardDescription>Gerencie os vídeos embedados</CardDescription>
              </div>
              <Button onClick={abrirNovoVideo}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Vídeo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <PlayCircle className="h-4 w-4 text-muted-foreground" />
                          {v.titulo}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{v.url}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => abrirEditarVideo(v)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removerVideo(v.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {videos.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhum vídeo cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{videoMode === "create" ? "Novo Vídeo" : "Editar Vídeo"}</DialogTitle>
                <DialogDescription>Informe título e link embed (ex: https://www.youtube.com/embed/...)</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vtitulo">Título</Label>
                  <Input
                    id="vtitulo"
                    value={videoForm.titulo}
                    onChange={(e) => setVideoForm((f) => ({ ...f, titulo: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vurl">URL</Label>
                  <Input
                    id="vurl"
                    placeholder="https://www.youtube.com/embed/..."
                    value={videoForm.url}
                    onChange={(e) => setVideoForm((f) => ({ ...f, url: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setVideoDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={salvarVideo}>
                    {videoMode === "create" ? "Criar" : "Salvar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>FAQ</CardTitle>
                <CardDescription>Perguntas frequentes para usuários</CardDescription>
              </div>
              <Button onClick={abrirNovaFaq}>
                <Plus className="h-4 w-4 mr-2" />
                Nova FAQ
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pergunta</TableHead>
                      <TableHead>Resposta</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          {f.pergunta}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{f.resposta}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => abrirEditarFaq(f)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removerFaq(f.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {faqs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhuma FAQ cadastrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{faqMode === "create" ? "Nova FAQ" : "Editar FAQ"}</DialogTitle>
                <DialogDescription>Adicione uma pergunta e sua resposta</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fpergunta">Pergunta</Label>
                  <Input
                    id="fpergunta"
                    value={faqForm.pergunta}
                    onChange={(e) => setFaqForm((f) => ({ ...f, pergunta: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fresposta">Resposta</Label>
                  <Textarea
                    id="fresposta"
                    rows={4}
                    value={faqForm.resposta}
                    onChange={(e) => setFaqForm((f) => ({ ...f, resposta: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setFaqDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={salvarFaq}>
                    {faqMode === "create" ? "Criar" : "Salvar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tickets */}
        <TabsContent value="tickets">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>Filtre e responda aos tickets abertos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tbusca">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="tbusca"
                      placeholder="Assunto, mensagem ou usuário..."
                      value={buscaTicket}
                      onChange={(e) => setBuscaTicket(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tstatus">Status</Label>
                  <Select value={statusFiltro} onValueChange={(v) => setStatusFiltro((v === "all" ? "" : (v as any)))}>
                    <SelectTrigger id="tstatus">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="aberto">Aberto</SelectItem>
                      <SelectItem value="em_andamento">Em andamento</SelectItem>
                      <SelectItem value="resolvido">Resolvido</SelectItem>
                      <SelectItem value="fechado">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assunto</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketsFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhum ticket encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      ticketsFiltrados.map((t) => {
                        const usuario = mockUsers.find((u) => u.id === t.usuarioId)
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.assunto}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {usuario?.nome} ({usuario?.email})
                            </TableCell>
                            <TableCell>
                              <Badge variant={badgeStatus(t.status)}>{t.status.replace("_", " ")}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{t.prioridade}</Badge>
                            </TableCell>
                            <TableCell>{t.createdAt.toLocaleString("pt-BR")}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => abrirTicket(t)}>
                                <MessageSquare className="h-4 w-4" />
                              </Button>
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

          <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes do Ticket</DialogTitle>
                <DialogDescription>{ticketSelecionado?.assunto}</DialogDescription>
              </DialogHeader>

              {ticketSelecionado && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Select value={ticketSelecionado.status} onValueChange={(v) => alterarStatusTicket(v as any)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aberto">Aberto</SelectItem>
                        <SelectItem value="em_andamento">Em andamento</SelectItem>
                        <SelectItem value="resolvido">Resolvido</SelectItem>
                        <SelectItem value="fechado">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Mensagens</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-md border">
                        <p className="text-sm">{ticketSelecionado.mensagem}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {ticketSelecionado.createdAt.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      {(ticketSelecionado.respostas ?? []).map((r) => {
                        const autor = mockUsers.find((u) => u.id === r.usuarioId)
                        return (
                          <div key={r.id} className="p-3 rounded-md border">
                            <p className="text-sm">{r.mensagem}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {autor?.nome || "Usuário"} • {r.createdAt.toLocaleString("pt-BR")}
                            </p>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label htmlFor="resposta">Responder</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="resposta"
                        rows={3}
                        className="flex-1"
                        placeholder="Digite sua resposta..."
                        value={respostaTexto}
                        onChange={(e) => setRespostaTexto(e.target.value)}
                      />
                      <Button type="button" onClick={responderTicket} disabled={!respostaTexto.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </>
  )
}


