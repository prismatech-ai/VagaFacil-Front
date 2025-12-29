"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, X, CheckCircle2, HelpCircle, Briefcase, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { api } from "@/lib/api"

interface CompetenciaFiltro {
  id: string
  nome: string
  nivelMinimo: 1 | 2 | 3 | 4
  descricao?: string
}

interface CadastroVagaProps {
  onSubmit?: (vaga: any) => void
  isLoading?: boolean
}

const AREAS_DISPONIVEIS = [
  { id: "eletrica", nome: "Elétrica" },
  { id: "manutencao", nome: "Manutenção" },
  { id: "automacao", nome: "Automação" },
  { id: "mecanica", nome: "Mecânica" },
  { id: "hidraulica", nome: "Hidráulica" },
  { id: "pneumatica", nome: "Pneumática" },
  { id: "soldagem", nome: "Soldagem" },
  { id: "usinagem", nome: "Usinagem" },
  { id: "qualidade", nome: "Qualidade" },
  { id: "planejamento", nome: "Planejamento" },
]

const COMPETENCIAS_DISPONIVEIS = [
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Docker",
  "Next.js",
  "TailwindCSS",
  "REST API",
  "Python",
  "SQL",
  "Git",
  "AWS",
]

export function CadastroVaga({ onSubmit, isLoading = false }: CadastroVagaProps) {
  const router = useRouter()
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [area, setArea] = useState("")
  const [competencias, setCompetencias] = useState<CompetenciaFiltro[]>([])
  const [competenciaTemp, setCompetenciaTemp] = useState<{ nome: string; nivelMinimo: 1 | 2 | 3 | 4 }>({
    nome: "",
    nivelMinimo: 2,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleAddCompetencia = () => {
    if (!competenciaTemp.nome) {
      setErrors({ ...errors, competencia: "Selecione uma competência" })
      return
    }

    if (competencias.find((c) => c.nome === competenciaTemp.nome)) {
      setErrors({ ...errors, competencia: "Esta competência já foi adicionada" })
      return
    }

    setCompetencias([
      ...competencias,
      {
        id: competenciaTemp.nome.toLowerCase().replace(/\s+/g, "-"),
        nome: competenciaTemp.nome,
        nivelMinimo: competenciaTemp.nivelMinimo,
      },
    ])
    setCompetenciaTemp({ nome: "", nivelMinimo: 2 })
    setErrors({ ...errors, competencia: "" })
  }

  const handleRemoveCompetencia = (id: string) => {
    setCompetencias(competencias.filter((c) => c.id !== id))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!titulo.trim()) newErrors.titulo = "Título é obrigatório"
    if (!descricao.trim()) newErrors.descricao = "Descrição é obrigatória"
    if (!area) newErrors.area = "Área é obrigatória"
    if (competencias.length === 0) newErrors.competencias = "Adicione pelo menos uma competência"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    se// POST /empresa/vagas
      const payload = {
        title: titulo,
        description: descricao,
        area_atuacao: area,
        requirements: descricao,
        benefits: "A definir",
        location: "A definir",
        remote: true,
        job_type: "CLT",
        salary_min: 0,
        salary_max: 0,
        requisitos: competencias.map((comp) => ({
          competencia_id: comp.id,
          nivel_minimo: String(comp.nivelMinimo),
          teste_obrigatorio: 0
        }))
      }

      const response = await api.post("/empresa/vagas", payload)
      
      if (response.id) {
        console.log("Vaga criada com ID:", response.id)
        router.push("/empresa/jobs/list")
      }
    } catch (error) {
      console.error("Erro ao criar vaga:", error)
      setErrors({ ...errors, submit: "Erro ao criar vaga. Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-[#03565C] to-[#24BFB0] text-white">
            <CardTitle className="text-2xl">Registrar Nova Vaga</CardTitle>
            <CardDescription className="text-white/80">
              Defina as competências que os candidatos devem ter
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Vaga *</Label>
                <Input
                  id="titulo"
                  placeholder="ex: Senior React Developer"
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value)
                    if (errors.titulo) s.id} value={a.id}>
                        {a.nome
                  disabled={loading || isLoading}
                  className={errors.titulo ? "border-red-500" : ""}
                />
                {errors.titulo && <p className="text-sm text-red-500">{errors.titulo}</p>}
              </div>

              {/* Área */}
              <div className="space-y-2">
                <Label htmlFor="area">Área de Atuação *</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger id="area" className={errors.area ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS_DISPONIVEIS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.area && <p className="text-sm text-red-500">{errors.area}</p>}
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição da Vaga *</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva a vaga, responsabilidades, e o que procura..."
                  value={descricao}
                  onChange={(e) => {
                    setDescricao(e.target.value)
                    if (errors.descricao) setErrors({ ...errors, descricao: "" })
                  }}
                  disabled={loading || isLoading}
                  className={`min-h-32 ${errors.descricao ? "border-red-500" : ""}`}
                />
                {errors.descricao && <p className="text-sm text-red-500">{errors.descricao}</p>}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Filtros de Competência</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Adicione as competências que você busca nos candidatos. Apenas candidatos que
                  declarem essas competências no nível mínimo especificado poderão ser encontrados.
                </p>
              </div>

              {/* Adicionar Competência */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="competencia">Adicionar Competência *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={competenciaTemp.nome}
                      onValueChange={(v) => setCompetenciaTemp({ ...competenciaTemp, nome: v })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione uma competência" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPETENCIAS_DISPONIVEIS.map((comp) => (
                          <SelectItem key={comp} value={comp}>
                            {comp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={String(competenciaTemp.nivelMinimo)}
                      onValueChange={(v) =>
                        setCompetenciaTemp({ ...competenciaTemp, nivelMinimo: parseInt(v) as 1 | 2 | 3 | 4 })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Iniciante (1)</SelectItem>
                        <SelectItem value="2">Intermediário (2)</SelectItem>
                        <SelectItem value="3">Avançado (3)</SelectItem>
                        <SelectItem value="4">Expert (4)</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      onClick={handleAddCompetencia}
                      disabled={loading || isLoading}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                  {errors.competencia && <p className="text-sm text-red-500">{errors.competencia}</p>}
                </div>

                {/* Competências Adicionadas */}
                {competencias.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Competências Adicionadas ({competencias.length}):
                    </p>
                    <div className="space-y-2">
                      {competencias.map((comp) => (
                        <div
                          key={comp.id}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">{comp.nome}</p>
                            <p className="text-xs text-gray-600">
                              Nível Mínimo:{" "}
                              {comp.nivelMinimo === 1
                                ? "Iniciante"
                                : comp.nivelMinimo === 2
                                  ? "Intermediário"
                                  : comp.nivelMinimo === 3
                                    ? "Avançado"
                                    : "Expert"}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCompetencia(comp.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errors.competencias && <p className="text-sm text-red-500">{errors.competencias}</p>}
              </div>

              {/* Info */}
              <Alert className="border-[#24BFB0]/30 bg-[#25D9B8]/10">
                <AlertCircle className="h-4 w-4 text-[#03565C]" />
                <AlertDescription className="text-[#03565C] text-sm">
                  <strong>Como funciona:</strong> Essa vaga será visível apenas para candidatos que
                  declarem as competências especificadas no nível mínimo (ou superior). Candidatos
                  permanecerão anônimos até que você demonstre interesse.
                </AlertDescription>
              </Alert>

              {/* CTA */}
              <Button
                type="submit"
                disabled={loading || isLoading}
                className="w-full gap-2 bg-[#03565C] hover:bg-[#024147] py-6 text-base"
              >
                {loading || isLoading ? "Criando..." : "Criar Vaga"}
                {!(loading || isLoading) && <ChevronRight className="h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
