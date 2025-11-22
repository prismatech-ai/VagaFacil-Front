"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"
import { UploadCurriculo } from "@/components/upload-curriculo"
import type { Candidato } from "@/lib/types"

const TOTAL_STEPS = 4

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    telefone: "",
    localizacao: "",
    habilidades: [] as string[],
    curriculo: "",
    curriculoArquivo: null as string | null,
    curriculoNome: null as string | null,
    linkedin: "",
    portfolio: "",
  })
  const [habilidadeInput, setHabilidadeInput] = useState("")

  if (!user || user.role !== "candidato") {
    router.push("/dashboard")
    return null
  }

  const progress = (currentStep / TOTAL_STEPS) * 100

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Salvar dados do onboarding
    const updatedUser: Candidato = {
      ...(user as Candidato),
      ...formData,
      curriculoArquivo: formData.curriculoArquivo || undefined,
      curriculoNome: formData.curriculoNome || undefined,
      onboardingCompleto: true,
    }
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    router.push("/dashboard/candidato")
  }

  const addHabilidade = () => {
    if (habilidadeInput.trim() && !formData.habilidades.includes(habilidadeInput.trim())) {
      setFormData({
        ...formData,
        habilidades: [...formData.habilidades, habilidadeInput.trim()],
      })
      setHabilidadeInput("")
    }
  }

  const removeHabilidade = (habilidade: string) => {
    setFormData({
      ...formData,
      habilidades: formData.habilidades.filter((h) => h !== habilidade),
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-secondary/30">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">Bem-vindo ao Vaga Facil!</CardTitle>
                <span className="text-sm text-muted-foreground">
                  Passo {currentStep} de {TOTAL_STEPS}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <CardDescription>Complete seu perfil para começar a encontrar as melhores oportunidades</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Passo 1: Informações Básicas */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    type="text"
                    placeholder="Ex: São Paulo - SP"
                    value={formData.localizacao}
                    onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Passo 2: Habilidades */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Suas Habilidades</h3>
                <div className="space-y-2">
                  <Label htmlFor="habilidade">Adicionar Habilidade</Label>
                  <div className="flex gap-2">
                    <Input
                      id="habilidade"
                      type="text"
                      placeholder="Ex: React, TypeScript, Node.js"
                      value={habilidadeInput}
                      onChange={(e) => setHabilidadeInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addHabilidade()}
                    />
                    <Button type="button" onClick={addHabilidade}>
                      Adicionar
                    </Button>
                  </div>
                </div>
                {formData.habilidades.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.habilidades.map((habilidade) => (
                      <div
                        key={habilidade}
                        className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm"
                      >
                        <span>{habilidade}</span>
                        <button
                          type="button"
                          onClick={() => removeHabilidade(habilidade)}
                          className="text-primary hover:text-primary/80"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Passo 3: Links e Portfólio */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Links e Portfólio</h3>
                <div className="space-y-2">
                  <Label>Arquivo do Currículo (opcional)</Label>
                  <UploadCurriculo
                    onFileUpload={(file) => {
                      // Converte arquivo para base64 (em produção, enviaria para servidor)
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        const base64String = reader.result as string
                        setFormData({ 
                          ...formData, 
                          curriculoArquivo: base64String,
                          curriculoNome: file.name
                        })
                      }
                      reader.readAsDataURL(file)
                    }}
                    currentFile={formData.curriculoArquivo || undefined}
                    currentFileName={formData.curriculoNome || undefined}
                    onRemove={() => setFormData({ ...formData, curriculoArquivo: null, curriculoNome: null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn (opcional)</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/seu-perfil"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfólio (opcional)</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    placeholder="https://seuportfolio.com"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curriculo">Resumo Profissional</Label>
                  <Textarea
                    id="curriculo"
                    placeholder="Conte um pouco sobre você, suas experiências e objetivos profissionais..."
                    value={formData.curriculo}
                    onChange={(e) => setFormData({ ...formData, curriculo: e.target.value })}
                    rows={6}
                  />
                </div>
              </div>
            )}

            {/* Passo 4: Confirmação */}
            {currentStep === 4 && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold">Perfil Completo!</h3>
                <p className="text-muted-foreground">
                  Você completou o onboarding. Agora pode começar a explorar vagas e se candidatar às melhores
                  oportunidades!
                </p>
              </div>
            )}

            {/* Navegação */}
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button type="button" onClick={handleNext}>
                {currentStep === TOTAL_STEPS ? (
                  <>
                    Finalizar
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
