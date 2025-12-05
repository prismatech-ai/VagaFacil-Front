"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Clock, Award } from "lucide-react"
import type { Questao, ResultadoTeste, RespostaQuestao } from "@/lib/types"
import { mockQuestoes } from "@/lib/mock-data"
import { api } from "@/lib/api"

export default function TestesPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [testeEmAndamento, setTesteEmAndamento] = useState(false)
  const [questaoAtual, setQuestaoAtual] = useState(0)
  const [nivelAtual, setNivelAtual] = useState<"facil" | "medio" | "dificil">("facil")
  const [respostas, setRespostas] = useState<RespostaQuestao[]>([])
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [questoesDisponiveis, setQuestoesDisponiveis] = useState<Questao[]>([])
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(null)
  const [resultado, setResultado] = useState<ResultadoTeste | null>(null)
  const [tempoInicio, setTempoInicio] = useState<Date | null>(null)

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
      loadQuestoes()
    }
  }, [user, isLoading, router])

  const loadQuestoes = async () => {
    try {
      // #colocarRota - Ajuste a rota conforme seu backend
      const questoesData = await api.get<Questao[]>("/testes/questoes").catch(() => {
        console.warn("Erro ao carregar questões, usando dados mockados")
        return mockQuestoes
      })

      setQuestoesDisponiveis(Array.isArray(questoesData) ? questoesData : mockQuestoes)
    } catch (error) {
      console.error("Erro ao carregar questões:", error)
      setQuestoesDisponiveis(mockQuestoes)
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

  const iniciarTeste = () => {
    const questoesFacil = questoesDisponiveis.filter((q) => q.nivelDificuldade === "facil").slice(0, 3)
    setQuestoes(questoesFacil)
    setNivelAtual("facil")
    setQuestaoAtual(0)
    setRespostas([])
    setRespostaSelecionada(null)
    setResultado(null)
    setTempoInicio(new Date())
    setTesteEmAndamento(true)
  }

  const proximaQuestao = () => {
    if (respostaSelecionada === null) return

    const questao = questoes[questaoAtual]
    const correta = respostaSelecionada === questao.respostaCorreta
    const tempoResposta = tempoInicio ? Date.now() - tempoInicio.getTime() : 0

    const novaResposta: RespostaQuestao = {
      questaoId: questao.id,
      resposta: respostaSelecionada,
      correta,
      tempoResposta,
    }

    const novasRespostas = [...respostas, novaResposta]
    setRespostas(novasRespostas)

    // Adaptação do nível de dificuldade
    if (questaoAtual < questoes.length - 1) {
      const acertos = novasRespostas.filter((r) => r.correta).length
      const total = novasRespostas.length

      if (acertos / total >= 0.7 && nivelAtual === "facil") {
        // Subir para médio
        const questoesMedio = questoesDisponiveis.filter((q) => q.nivelDificuldade === "medio").slice(0, 2)
        setQuestoes([...questoes, ...questoesMedio])
        setNivelAtual("medio")
      } else if (acertos / total >= 0.7 && nivelAtual === "medio") {
        // Subir para difícil
        const questoesDificil = questoesDisponiveis.filter((q) => q.nivelDificuldade === "dificil").slice(0, 2)
        setQuestoes([...questoes, ...questoesDificil])
        setNivelAtual("dificil")
      } else if (acertos / total < 0.5 && nivelAtual === "medio") {
        // Descer para fácil
        const questoesFacil = questoesDisponiveis.filter((q) => q.nivelDificuldade === "facil").slice(0, 2)
        setQuestoes([...questoes, ...questoesFacil])
        setNivelAtual("facil")
      }
    }

    if (questaoAtual < questoes.length - 1) {
      setQuestaoAtual(questaoAtual + 1)
      setRespostaSelecionada(null)
      setTempoInicio(new Date())
    } else {
      finalizarTeste(novasRespostas)
    }
  }

  const finalizarTeste = async (todasRespostas: RespostaQuestao[]) => {
    const acertos = todasRespostas.filter((r) => r.correta).length
    const total = todasRespostas.length
    const pontuacao = Math.round((acertos / total) * 100)

    // Determinar nível final baseado na pontuação
    let nivelFinal: "facil" | "medio" | "dificil" = "facil"
    if (pontuacao >= 80) {
      nivelFinal = "dificil"
    } else if (pontuacao >= 60) {
      nivelFinal = "medio"
    }

    const resultadoFinal: ResultadoTeste = {
      id: Date.now().toString(),
      testeId: "teste-dinamico",
      candidatoId: user.id,
      pontuacao,
      totalQuestoes: total,
      nivelFinal,
      respostas: todasRespostas,
      dataRealizacao: new Date(),
    }

    try {
      // #colocarRota - Ajuste a rota conforme seu backend
      await api.post("/testes/resultados", resultadoFinal)
      setResultado(resultadoFinal)
      setTesteEmAndamento(false)
    } catch (error) {
      console.error("Erro ao salvar resultado do teste:", error)
      // Mesmo com erro, mostra o resultado para o usuário
      setResultado(resultadoFinal)
      setTesteEmAndamento(false)
    }
  }

  const questao = questoes[questaoAtual]
  const progresso = questoes.length > 0 ? ((questaoAtual + 1) / questoes.length) * 100 : 0

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <DashboardHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Testes Dinâmicos</h2>
          <p className="text-muted-foreground">Realize testes adaptativos e melhore seu perfil profissional</p>
        </div>

        {!testeEmAndamento && !resultado && (
          <Card>
            <CardHeader>
              <CardTitle>Teste Dinâmico de Conhecimentos</CardTitle>
              <CardDescription>
                Este teste se adapta ao seu desempenho, ajustando a dificuldade das questões conforme você responde
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Como funciona:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>O teste começa com questões de nível fácil</li>
                  <li>Se você acertar 70% ou mais, o nível aumenta</li>
                  <li>Se você errar muitas questões, o nível diminui</li>
                  <li>O teste se adapta ao seu desempenho em tempo real</li>
                </ul>
              </div>
              <Button onClick={iniciarTeste} className="w-full">
                Iniciar Teste
              </Button>
            </CardContent>
          </Card>
        )}

        {testeEmAndamento && questao && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle>Questão {questaoAtual + 1} de {questoes.length}</CardTitle>
                <Badge variant="outline">
                  Nível: {nivelAtual === "facil" ? "Fácil" : nivelAtual === "medio" ? "Médio" : "Difícil"}
                </Badge>
              </div>
              <Progress value={progresso} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">{questao.pergunta}</h3>
                <RadioGroup value={respostaSelecionada?.toString()} onValueChange={(v) => setRespostaSelecionada(parseInt(v))}>
                  {questao.opcoes.map((opcao, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value={index.toString()} id={`opcao-${index}`} />
                      <Label htmlFor={`opcao-${index}`} className="flex-1 cursor-pointer">
                        {opcao}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <Button onClick={proximaQuestao} disabled={respostaSelecionada === null} className="w-full">
                {questaoAtual < questoes.length - 1 ? "Próxima Questão" : "Finalizar Teste"}
              </Button>
            </CardContent>
          </Card>
        )}

        {resultado && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Award className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">Teste Finalizado!</CardTitle>
              <CardDescription className="text-center">Veja seus resultados abaixo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{resultado.pontuacao}%</div>
                  <div className="text-sm text-muted-foreground">Pontuação</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {resultado.respostas.filter((r) => r.correta).length}/{resultado.totalQuestoes}
                  </div>
                  <div className="text-sm text-muted-foreground">Acertos</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {resultado.nivelFinal === "facil" ? "Fácil" : resultado.nivelFinal === "medio" ? "Médio" : "Difícil"}
                  </div>
                  <div className="text-sm text-muted-foreground">Nível Final</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Detalhes das Respostas:</h3>
                {resultado.respostas.map((resposta, index) => {
                  const questao = questoes.find((q) => q.id === resposta.questaoId)
                  return (
                    <div key={index} className="p-3 border rounded-lg flex items-center gap-3">
                      {resposta.correta ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">Questão {index + 1}</p>
                        {questao && <p className="text-xs text-muted-foreground">{questao.pergunta}</p>}
                      </div>
                      <Badge variant={resposta.correta ? "default" : "destructive"}>
                        {resposta.correta ? "Correta" : "Incorreta"}
                      </Badge>
                    </div>
                  )
                })}
              </div>

              <Button onClick={() => setResultado(null)} className="w-full">
                Fazer Novo Teste
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
