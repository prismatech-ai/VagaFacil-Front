"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Edit, Trash2, Users, CheckCircle2, Clock } from "lucide-react"

export default function VagaDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const vagaId = params.id as string

  // Mock data - em produção viria de uma API
  const vaga = {
    id: vagaId,
    titulo: "Desenvolvedor React Sênior",
    descricao: "Procuramos um desenvolvedor React com experiência em TypeScript e aplicações em larga escala",
    area: "Frontend",
    setor: "Tecnologia",
    nivelSenioridade: "Sênior",
    salarioMin: 8000,
    salarioMax: 12000,
    tipoContrato: "CLT",
    local: "São Paulo, SP",
    dataCriacao: "2024-01-05",
    dataAtualizacao: "2024-01-15",
    statusVaga: "aberta",
    competenciasRequeridas: [
      { nome: "React", nivelMinimo: 3 },
      { nome: "TypeScript", nivelMinimo: 3 },
      { nome: "Node.js", nivelMinimo: 2 },
      { nome: "PostgreSQL", nivelMinimo: 2 },
      { nome: "Git", nivelMinimo: 2 },
    ],
    beneficios: [
      "Vale refeição",
      "Vale transporte",
      "Plano de saúde",
      "Gympass",
      "Home office",
    ],
    candidatosTotal: 5,
    candidatosComTestes: 3,
    candidatosComInteresse: 2,
    responsavel: "Maria Santos",
    emailResponsavel: "maria@company.com",
  }

  const getNivelLabel = (nivel: number) => {
    const niveis = {
      1: "Iniciante",
      2: "Intermediário",
      3: "Avançado",
      4: "Expert",
    }
    return niveis[nivel as keyof typeof niveis] || "Desconhecido"
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{vaga.titulo}</h1>
          <p className="text-gray-600 mt-1">{vaga.area} • {vaga.nivelSenioridade}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
            Deletar
          </Button>
        </div>
      </div>

      {/* Status and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-2xl font-bold text-[#03565C] mt-1">
                  {vaga.statusVaga === "aberta" ? "Aberta" : "Fechada"}
                </p>
              </div>
              <Badge className="bg-[#03565C] text-white">
                {vaga.statusVaga === "aberta" ? "Ativa" : "Inativa"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Candidatos Alinhados</p>
                <p className="text-2xl font-bold text-[#03565C] mt-1">
                  {vaga.candidatosTotal}
                </p>
              </div>
              <Users className="h-6 w-6 text-[#03565C] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Com Interesse</p>
                <p className="text-2xl font-bold text-[#03565C] mt-1">
                  {vaga.candidatosComInteresse}
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Sobre a Vaga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-900 text-base leading-relaxed">
                  {vaga.descricao}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Tipo de Contrato</p>
                  <p className="font-semibold text-gray-900">{vaga.tipoContrato}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Local</p>
                  <p className="font-semibold text-gray-900">{vaga.local}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Salário Mês</p>
                  <p className="font-semibold text-gray-900">
                    R$ {vaga.salarioMin.toLocaleString()} - R$ {vaga.salarioMax.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Setor</p>
                  <p className="font-semibold text-gray-900">{vaga.setor}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Required Competencies */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Competências Requeridas</CardTitle>
              <CardDescription>
                Candidatos devem ter essas competências no mínimo especificado para aparecer nesta vaga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vaga.competenciasRequeridas.map((comp) => (
                  <div
                    key={comp.nome}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="font-medium text-gray-900">{comp.nome}</span>
                    <Badge variant="outline" className="bg-[#25D9B8]/10 border-[#24BFB0]/30 text-[#03565C]">
                      Nível {comp.nivelMinimo} - {getNivelLabel(comp.nivelMinimo)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Benefícios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {vaga.beneficios.map((beneficio) => (
                  <div
                    key={beneficio}
                    className="flex items-center gap-2 p-2 bg-[#25D9B8]/10 rounded-lg border border-[#24BFB0]/30"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#03565C] flex-shrink-0" />
                    <span className="text-sm text-gray-900">{beneficio}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Responsável */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Responsável</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-semibold text-gray-900">{vaga.responsavel}</p>
              <p className="text-sm text-gray-600">{vaga.emailResponsavel}</p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Criada em</p>
                <p className="font-medium text-gray-900">
                  {new Date(vaga.dataCriacao).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-gray-600">Última atualização</p>
                <p className="font-medium text-gray-900">
                  {new Date(vaga.dataAtualizacao).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full gap-2 bg-[#03565C] hover:bg-[#024147]">
              <Users className="h-4 w-4" />
              Ver Kanban
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/empresa/jobs/list`)}
            >
              Voltar à Lista
            </Button>
          </div>

          {/* Info Alert */}
          <Alert className="border-[#24BFB0]/30 bg-[#25D9B8]/10">
            <AlertCircle className="h-4 w-4 text-[#03565C]" />
            <AlertDescription className="text-[#03565C] text-sm">
              <strong>Candidatos:</strong> Aparecem apenas aqueles que atendem aos requisitos mínimos de competências declaradas.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
