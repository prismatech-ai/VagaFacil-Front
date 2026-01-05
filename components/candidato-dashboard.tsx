"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CheckCircle2, Clock, AlertCircle, Sparkles, HeartHandshake } from "lucide-react"

interface Interesse {
  id: string
  dataInteresse: string
  status: "novo" | "aceito" | "rejeitado"
  descricao: string // Ex: "Uma empresa demonstrou interesse em você"
}

interface TesteTecnico {
  id: string
  nome: string
  data: string
  status: "concluido" | "pendente" | "expirado"
  duracao?: string
}

interface CandidatoDashboardProps {
  areaAtuacao: string
  nomeCompleto?: string
  perfilCompleto?: boolean
  onAceitarEntrevista?: (interesseId: string) => void
  interesses?: Interesse[]
  testes?: TesteTecnico[]
  candidatoData?: {
    id?: number
    full_name?: string
    email?: string
    phone?: string
    area_atuacao?: string
    bio?: string
    linkedin_url?: string
    portfolio_url?: string
    resume_url?: string
    cep?: string
    logradouro?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    birth_date?: string
    cpf?: string
    rg?: string
    genero?: string
    estado_civil?: string
  }
}

export function CandidatoDashboard({
  areaAtuacao = "Frontend",
  nomeCompleto = "Usuário",
  perfilCompleto = true,
  onAceitarEntrevista,
  interesses: interessesInit = [],
  testes: testesInit = [],
  candidatoData,
}: CandidatoDashboardProps) {
  const router = useRouter()
  const [interesses, setInteresses] = useState<Interesse[]>(interessesInit)

  // Função para calcular o percentual de completude
  const calcularCompletudePercentual = (): number => {
    if (!candidatoData) return 0

    const camposVerificacao = {
      full_name: !!candidatoData.full_name,
      email: !!candidatoData.email,
      phone: !!candidatoData.phone,
      area_atuacao: !!candidatoData.area_atuacao,
      bio: !!candidatoData.bio,
      linkedin_url: !!candidatoData.linkedin_url,
      portfolio_url: !!candidatoData.portfolio_url,
      resume_url: !!candidatoData.resume_url,
      birth_date: !!candidatoData.birth_date,
      cpf: !!candidatoData.cpf,
      rg: !!candidatoData.rg,
      cep: !!candidatoData.cep,
      logradouro: !!candidatoData.logradouro,
      numero: !!candidatoData.numero,
      bairro: !!candidatoData.bairro,
      cidade: !!candidatoData.cidade,
      estado: !!candidatoData.estado,
    }

    const totalCampos = Object.keys(camposVerificacao).length
    const camposPreenchidos = Object.values(camposVerificacao).filter(Boolean).length

    return Math.round((camposPreenchidos / totalCampos) * 100)
  }

  const completudePerfil = calcularCompletudePercentual()

  const handleAceitarEntrevista = (interesseId: string) => {
    setInteresses(
      interesses.map((i) =>
        i.id === interesseId ? { ...i, status: "aceito" as const } : i
      )
    )
    // Navega para a tela de aceite de entrevista com parâmetros
    const params = new URLSearchParams({
      id: interesseId,
      empresa: "TechCorp",
      vaga: "Desenvolvedor React Sênior",
      data: new Date().toISOString().split("T")[0],
      competencias: "React,TypeScript,Node.js",
    })
    router.push(`/interview-acceptance?${params.toString()}`)
    onAceitarEntrevista?.(interesseId)
  }

  const interessesNovos = interesses.filter((i) => i.status === "novo").length
  const interessesAceitos = interesses.filter((i) => i.status === "aceito").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Bem-vindo de volta, {nomeCompleto.split(" ")[0]}!
          </h1>
          <p className="text-gray-600">
            Acompanhe o progresso do seu processo de candidatura
          </p>
        </div>

        {/* Alerta de Perfil Incompleto */}
        {completudePerfil < 100 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <span className="font-medium">Seu perfil está incompleto. Complete agora para receber mais oportunidades!</span>
                <Button
                  size="sm"
                  onClick={() => router.push("/dashboard/candidato/meu-perfil")}
                  className="ml-4 bg-orange-600 hover:bg-orange-700"
                >
                  Completar Perfil
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Status Cards - 3 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card: Completude do Perfil */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Status do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completude</span>
                  <span className="font-semibold text-gray-900">{completudePerfil}%</span>
                </div>
                <Progress value={completudePerfil} className="h-2" />
              </div>
              <div className="text-sm text-gray-600">
                <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                  Área: {areaAtuacao}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card: Interesse de Empresas */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                <Sparkles className="h-5 w-5 text-[#03565C]" />
                Interesse de Empresas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-[#03565C]">{interessesNovos}</div>
              <p className="text-sm text-gray-600">
                {interessesNovos === 1
                  ? "empresa demonstrou interesse"
                  : "empresas demonstraram interesse"}
              </p>
              {interessesAceitos > 0 && (
                <Badge variant="secondary" className="w-fit">
                  {interessesAceitos} aceito{interessesAceitos > 1 ? "s" : ""}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Card: Testes Realizados */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                <Clock className="h-5 w-5 text-[#24BFB0]" />
                Testes Realizados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-[#03565C]">
                {testesInit.filter((t) => t.status === "concluido").length}
              </div>
              <p className="text-sm text-gray-600">
                de {testesInit.length} teste{testesInit.length > 1 ? "s" : ""}
              </p>
              {testesInit.some((t) => t.status === "pendente") && (
                <Badge variant="outline" className="w-fit bg-yellow-50 text-yellow-800 border-yellow-200">
                  {testesInit.filter((t) => t.status === "pendente").length} pendente
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Privacy Alert */}
        <Alert className="border-[#24BFB0]/30 bg-[#25D9B8]/10">
          <AlertCircle className="h-4 w-4 text-[#03565C]" />
          <AlertDescription className="text-[#03565C] text-sm">
            <strong>Sua privacidade:</strong> Nenhum dado de empresas ou vagas é revelado nesta página.
            Você controla totalmente quais informações compartilha.
          </AlertDescription>
        </Alert>

        {/* Tabs Section */}
        <Tabs defaultValue="interesses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="interesses" className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4" />
              Interesse das Empresas
            </TabsTrigger>
            <TabsTrigger value="testes" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Histórico de Testes
            </TabsTrigger>
          </TabsList>

          {/* Tab: Interesses */}
          <TabsContent value="interesses" className="space-y-4">
            {interesses.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-8 pb-8 text-center">
                  <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Nenhum interesse de empresas por enquanto. Continue atualizando seu perfil!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {interesses.map((interesse) => (
                  <Card
                    key={interesse.id}
                    className={`border-0 shadow-sm transition-all ${
                      interesse.status === "novo"
                        ? "bg-[#25D9B8]/10 border-l-4 border-[#24BFB0]"
                        : interesse.status === "aceito"
                          ? "bg-emerald-50 border-l-4 border-emerald-500"
                          : "bg-gray-50"
                    }`}
                  >
                    <CardContent className="pt-6 pb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {interesse.descricao}
                            </p>
                            {interesse.status === "novo" && (
                              <Badge className="bg-blue-600 text-white text-xs">
                                Novo
                              </Badge>
                            )}
                            {interesse.status === "aceito" && (
                              <Badge className="bg-emerald-600 text-white text-xs">
                                Aceito
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(interesse.dataInteresse).toLocaleDateString("pt-BR")}
                          </p>
                        </div>

                        {interesse.status === "novo" && (
                          <div className="flex gap-2 flex-shrink-0">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-[#03565C] hover:bg-[#024147] text-white"
                                >
                                  Aceitar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Prosseguir para Aceite da Entrevista?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Você será levado para confirmar a aceitação da entrevista e
                                    autorizar o compartilhamento de seus dados com a empresa.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex gap-2">
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleAceitarEntrevista(interesse.id)}
                                    className="bg-[#03565C] hover:bg-[#024147]"
                                  >
                                    Prosseguir
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Testes */}
          <TabsContent value="testes">
            {testesInit.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-8 pb-8 text-center">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Você ainda não realizou nenhum teste técnico.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead>Teste</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testesInit.map((teste) => (
                        <TableRow key={teste.id} className="border-gray-200">
                          <TableCell className="font-medium text-gray-900">
                            {teste.nome}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(teste.data).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {teste.duracao || "-"}
                          </TableCell>
                          <TableCell>
                            {teste.status === "concluido" && (
                              <Badge className="bg-emerald-100 text-emerald-800">
                                Concluído
                              </Badge>
                            )}
                            {teste.status === "pendente" && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Pendente
                              </Badge>
                            )}
                            {teste.status === "expirado" && (
                              <Badge className="bg-red-100 text-red-800">
                                Expirado
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
