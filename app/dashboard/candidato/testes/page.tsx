"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { CandidatoSidebar } from "@/components/candidato-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, Award } from "lucide-react"

type RespostaQuestao = {
  questaoId: number | string
  resposta: number
  correta: boolean
  tempoResposta: number
}

type ResultadoTeste = {
  score: number
  dados_teste?: {
    total_perguntas: number
    acertos: number
  }
}

export default function TestesPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [testeEmAndamento, setTesteEmAndamento] = useState(false)
  const [questaoAtual, setQuestaoAtual] = useState<any>(null)
  const [respostas, setRespostas] = useState<RespostaQuestao[]>([])
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(null)
  const [resultado, setResultado] = useState<any>(null)
  const [tempoInicio, setTempoInicio] = useState<Date | null>(null)
  const [sessaoId, setSessaoId] = useState<string | null>(null)
  const [loadingQuestao, setLoadingQuestao] = useState(false)
  const [testesDisponiveis, setTestesDisponiveis] = useState<any[]>([])
  const [habilidadeSelecionada, setHabilidadeSelecionada] = useState('Python')
  const [nivelSelecionado, setNivelSelecionado] = useState('Básico')
  const [questoesCarregadas, setQuestoesCarregadas] = useState<any[]>([])
  const [indiceQuestao, setIndiceQuestao] = useState(0)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role !== "candidato") {
      router.push("/dashboard")
      return
    }

    if (user && user.role === "candidato") {
      loadTestes()
    }
  }, [user, isLoading, router])

  const loadTestes = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/testes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })

      if (response.ok) {
        const data = await response.json()
        const testesData = Array.isArray(data) ? data : (data.testes || data.data || [])
        setTestesDisponiveis(testesData)
      }
    } catch (error) {
      console.warn("Erro ao carregar testes:", error)
      setTestesDisponiveis([])
    }
  }

  if (isLoading || !user || user.role !== "candidato") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const iniciarTeste = async () => {
    try {
      setLoadingQuestao(true)
      const token = localStorage.getItem('token')
      if (!token) {
        alert("Token não encontrado")
        return
      }

      // Buscar TODAS as questões disponíveis (limite de 15)
      const params = new URLSearchParams({
        habilidade: habilidadeSelecionada,
        nivel: nivelSelecionado,
        limit: '15'
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/testes/questoes/filtrar?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro na resposta:', response.status, errorText)
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Resposta de questões:', data)
      
      // Extrair array de questões
      let questoes: any[] = []
      if (data?.questoes && Array.isArray(data.questoes)) {
        questoes = data.questoes
      } else if (Array.isArray(data)) {
        questoes = data
      }

      console.log(`Total de questões carregadas: ${questoes.length}`)
      
      if (questoes.length === 0) {
        alert(`Nenhuma questão disponível para ${habilidadeSelecionada} - ${nivelSelecionado}. Tente outro nível.`)
        setLoadingQuestao(false)
        return
      }
      
      // Armazenar todas as questões e iniciar com a primeira
      setQuestoesCarregadas(questoes)
      setIndiceQuestao(0)
      setQuestaoAtual(questoes[0])
      setRespostas([])
      setRespostaSelecionada(null)
      setResultado(null)
      setTempoInicio(new Date())
      setTesteEmAndamento(true)
      setLoadingQuestao(false)
    } catch (error) {
      console.error("Erro ao iniciar teste:", error)
      alert(`Erro ao iniciar teste: ${error instanceof Error ? error.message : 'Desconhecido'}`)
    } finally {
      setLoadingQuestao(false)
    }
  }

  const proximaQuestao = async () => {
    if (respostaSelecionada === null) return

    try {
      setLoadingQuestao(true)
      const token = localStorage.getItem('token')
      if (!token) {
        alert("Token não encontrado")
        return
      }

      // Salvar resposta atual
      const novaResposta: RespostaQuestao = {
        questaoId: questaoAtual.id,
        resposta: respostaSelecionada,
        correta: false,
        tempoResposta: tempoInicio ? Date.now() - tempoInicio.getTime() : 0,
      }
      
      const novasRespostas = [...respostas, novaResposta]
      setRespostas(novasRespostas)

      // Tentar enviar resposta para o servidor
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/testes/responder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            question_id: questaoAtual.id,
            alternative_id: respostaSelecionada
          })
        })
      } catch (e) {
        console.log('Endpoint de resposta não disponível')
      }

      // Avançar para próxima questão localmente
      const proximoIndice = indiceQuestao + 1
      
      if (proximoIndice < questoesCarregadas.length) {
        // Há mais questões
        console.log(`Questão ${proximoIndice + 1} de ${questoesCarregadas.length}`)
        setIndiceQuestao(proximoIndice)
        setQuestaoAtual(questoesCarregadas[proximoIndice])
        setRespostaSelecionada(null)
        setTempoInicio(new Date())
      } else {
        // Teste finalizado
        console.log('Teste finalizado - todas as questões respondidas')
        finalizarTeste()
      }
    } catch (error) {
      console.error("Erro ao responder questão:", error)
      alert(`Erro ao responder: ${error instanceof Error ? error.message : 'Desconhecido'}`)
    } finally {
      setLoadingQuestao(false)
    }
  }

  const finalizarTeste = async () => {
    try {
      setLoadingQuestao(true)
      const token = localStorage.getItem('token')
      if (!token) {
        alert("Token não encontrado")
        return
      }

      // Mostrar resultado final com as respostas
      console.log('Finalizando teste com respostas:', respostas)
      const totalRespostas = respostas.length
      const acertos = respostas.filter(r => r.correta).length
      const pontuacao = totalRespostas > 0 ? Math.round((acertos / totalRespostas) * 100) : 0
      console.log(`Total: ${totalRespostas}, Acertos: ${acertos}, Pontuação: ${pontuacao}%`)
      
      const resultadoFinal: ResultadoTeste = {
        score: pontuacao / 100,
        dados_teste: {
          total_perguntas: respostas.length,
          acertos: acertos
        }
      }

      setResultado(resultadoFinal)
      setTesteEmAndamento(false)
      
      // Marcar teste como concluído no localStorage
      localStorage.setItem("testeConcluido", "true")
    } catch (error) {
      console.error("Erro ao finalizar teste:", error)
      alert("Erro ao finalizar teste")
    } finally {
      setLoadingQuestao(false)
    }
  }

  const cancelarTeste = () => {
    if (confirm("Tem certeza que deseja cancelar o teste?")) {
      setTesteEmAndamento(false)
      setQuestaoAtual(null)
      setRespostas([])
      setSessaoId(null)
      setResultado(null)
    }
  }

  // Se não está em andamento e não tem resultado, mostrar tela inicial
  if (!testeEmAndamento && !resultado) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <CandidatoSidebar />
          <div className="flex-1 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
              <Card>
                <CardHeader>
                  <CardTitle>Teste de Habilidades</CardTitle>
                  <CardDescription>
                    Avalie suas habilidades através de um teste adaptativo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Como funciona:</h3>
                      <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                        <li>O teste é adaptativo e se ajusta ao seu nível de desempenho</li>
                        <li>Você responderá a várias questões de diferentes dificuldades</li>
                        <li>Acertos aumentam a dificuldade, erros podem diminuir</li>
                        <li>O resultado final será baseado no seu desempenho geral</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <div>
                      <Label htmlFor="habilidade" className="text-base font-semibold">Selecione a Habilidade</Label>
                      <select
                        id="habilidade"
                        value={habilidadeSelecionada}
                        onChange={(e) => setHabilidadeSelecionada(e.target.value)}
                        className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-sm"
                      >
                        <option value="Python">Python</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Java">Java</option>
                        <option value="C++">C++</option>
                        <option value="SQL">SQL</option>
                        <option value="React">React</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="nivel" className="text-base font-semibold">Selecione o Nível</Label>
                      <select
                        id="nivel"
                        value={nivelSelecionado}
                        onChange={(e) => setNivelSelecionado(e.target.value)}
                        className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-sm"
                      >
                        <option value="Básico">Básico</option>
                        <option value="Intermediário">Intermediário</option>
                        <option value="Avançado">Avançado</option>
                      </select>
                    </div>
                  </div>

                  <Button onClick={iniciarTeste} disabled={loadingQuestao} size="lg" className="w-full">
                    {loadingQuestao ? "Iniciando..." : "Iniciar Teste"}
                  </Button>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // Se tem resultado, mostrar resultado final
  if (resultado && !testeEmAndamento) {
    const pontuacao = resultado.dados_teste?.acertos ? 
      Math.round((resultado.dados_teste.acertos / (resultado.dados_teste.total_perguntas || 1)) * 100) : 
      Math.round(resultado.score * 100)
    
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <CandidatoSidebar />
          <div className="flex-1 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <div className="mb-4">
                    <Award className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  </div>
                  <CardTitle className="text-2xl">Teste Concluído!</CardTitle>
                  <CardDescription>Aqui está o seu resultado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-600 mb-2">
                      {pontuacao}%
                    </div>
                    <p className="text-lg text-muted-foreground">Pontuação Final</p>
                  </div>

                  {resultado.dados_teste && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Questões Respondidas</p>
                        <p className="text-2xl font-semibold">{resultado.dados_teste.total_perguntas}</p>
                      </div>
                      <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Respostas Corretas</p>
                        <p className="text-2xl font-semibold text-green-600">{resultado.dados_teste.acertos}</p>
                      </div>
                    </div>
                  )}

                  <Button onClick={() => router.push("/dashboard/candidato")} className="w-full">
                    Voltar ao Dashboard
                  </Button>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // Teste em andamento - mostrar questão
  if (!questaoAtual) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <CandidatoSidebar />
          <div className="flex-1 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando questão...</p>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // Mostrar questão atual
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <CandidatoSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardTitle>Teste de Habilidades</CardTitle>
                    <CardDescription>Questão {respostas.length + 1}</CardDescription>
                  </div>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Progress value={((respostas.length + 1) / 10) * 100} className="h-2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">
                    {questaoAtual?.texto_questao || questaoAtual?.pergunta || 'Carregando questão...'}
                  </h3>
                </div>

                <RadioGroup value={respostaSelecionada?.toString()} onValueChange={(val) => setRespostaSelecionada(parseInt(val))}>
                  <div className="space-y-3">
                    {((questaoAtual?.alternativas || questaoAtual?.opcoes || questaoAtual?.alternatives) || []).map((opcao: any, idx: number) => {
                      // opcao pode ser string ou objeto com {id, texto, ordem}
                      const textoOpcao = typeof opcao === 'string' ? opcao : (opcao?.texto || opcao?.text || opcao?.titulo || JSON.stringify(opcao))
                      return (
                        <div key={idx} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary cursor-pointer">
                          <RadioGroupItem value={idx.toString()} id={`opcao-${idx}`} />
                          <Label htmlFor={`opcao-${idx}`} className="cursor-pointer flex-1">
                            {textoOpcao}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </RadioGroup>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={cancelarTeste} disabled={loadingQuestao}>
                    Cancelar
                  </Button>
                  <Button onClick={proximaQuestao} disabled={respostaSelecionada === null || loadingQuestao} className="flex-1">
                    {loadingQuestao ? "Processando..." : "Próxima"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
