"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Lock, Zap, ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Competencia {
  nome: string
  nivelDeclarado: 1 | 2 | 3 | 4
  testeScore?: number
}

interface DetalhesCandidatoAnonimosProps {
  candidatoId: string
  competencias: Competencia[]
  dataCriacao?: string
  onDemonstraInteresse: () => void
  onBack: () => void
  isLoading?: boolean
}

const NIVEL_LABELS = {
  1: "Iniciante",
  2: "Intermediário",
  3: "Avançado",
  4: "Expert",
}

const NIVEL_CORES = {
  1: "bg-yellow-100 text-yellow-800 border-yellow-300",
  2: "bg-blue-100 text-blue-800 border-blue-300",
  3: "bg-indigo-100 text-indigo-800 border-indigo-300",
  4: "bg-purple-100 text-purple-800 border-purple-300",
}

export function DetalhesCandidatoAnonimos({
  candidatoId = "cand-uuid-001",
  competencias = [
    { nome: "React", nivelDeclarado: 3, testeScore: 8 },
    { nome: "TypeScript", nivelDeclarado: 2, testeScore: 7 },
  ],
  dataCriacao = "2024-01-05",
  onDemonstraInteresse,
  onBack,
  isLoading = false,
}: DetalhesCandidatoAnonimosProps) {
  const [demonstrouInteresse, setDemonstraInteresse] = useState(false)

  const handleDemonstraInteresse = () => {
    setDemonstraInteresse(true)
    onDemonstraInteresse()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="ghost"
          className="gap-2 mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para Kanban
        </Button>

        <Card className="shadow-lg border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Perfil Anônimo do Candidato
            </CardTitle>
            <CardDescription className="text-blue-100">
              Dados pessoais ocultos até demonstrar interesse
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8 space-y-6">
            {/* ID Anônimo */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">ID do Candidato (Anônimo)</p>
              <p className="font-mono text-lg text-gray-900 font-bold">{candidatoId}</p>
              <p className="text-xs text-gray-500 mt-2">
                Este é um UUID único que identifica o candidato de forma anônima
              </p>
            </div>

            {/* Privacy Alert */}
            <Alert className="border-amber-200 bg-amber-50">
              <Lock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Dados Pessoais Ocultos:</strong> Você não pode ver nome, email ou currículo
                neste momento. Esses dados só serão revelados após o candidato aceitar sua entrevista.
              </AlertDescription>
            </Alert>

            {/* Competências */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900">Competências Declaradas</h3>
              <div className="grid grid-cols-1 gap-3">
                {competencias.map((comp) => (
                  <div
                    key={comp.nome}
                    className={`p-4 rounded-lg border-2 border-gray-200 ${NIVEL_CORES[comp.nivelDeclarado]}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{comp.nome}</h4>
                      <Badge
                        className={`${NIVEL_CORES[comp.nivelDeclarado]} border text-xs`}
                      >
                        {NIVEL_LABELS[comp.nivelDeclarado]}
                      </Badge>
                    </div>

                    {comp.testeScore !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Score no Teste:</span>
                        <span className="font-bold text-green-600">{comp.testeScore}/10</span>
                      </div>
                    )}

                    {comp.testeScore === undefined && (
                      <div className="text-sm text-gray-600">
                        Teste não realizado
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Data de Cadastro */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Data de Cadastro</p>
              <p className="text-gray-900 font-semibold">
                {new Date(dataCriacao).toLocaleDateString("pt-BR")}
              </p>
            </div>

            {/* Info */}
            <Alert className="border-blue-200 bg-blue-50">
              <Zap className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm space-y-2">
                <p>
                  <strong>Próximo passo:</strong> Se estiver interessado neste candidato, clique em
                  "Demonstrar Interesse". Você poderá então enviar um convite de entrevista.
                </p>
                <p>
                  Apenas após o candidato aceitar a entrevista você terá acesso aos seus dados
                  pessoais (nome, email, currículo).
                </p>
              </AlertDescription>
            </Alert>

            {/* CTA */}
            {!demonstrouInteresse ? (
              <Button
                onClick={handleDemonstraInteresse}
                disabled={isLoading}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 py-6 text-base text-white"
              >
                <Zap className="h-4 w-4" />
                Demonstrar Interesse
              </Button>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Interesse Marcado!</strong> Você pode agora enviar um convite de
                  entrevista para este candidato. O próximo passo é contatar via email.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
