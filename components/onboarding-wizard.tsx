"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronRight, ChevronLeft } from "lucide-react"

interface OnboardingData {
  // Step 1 - Dados Pessoais
  nome: string
  email: string
  celular: string
  cidade: string
  isPCD: boolean
  pcdType: string
  adaptacoes: string

  // Step 2 - Dados Profissionais
  experiencia: string
  anosExperiencia: number
  escolaridade: string
  formacao: string
  habilidades: string[]

  // Step 3 - Testes
  testesRealizados: string
}

interface OnboardingWizardProps {
  isOpen: boolean
  onComplete: (data: OnboardingData) => void
  onClose: () => void
}

const HABILIDADES_DISPONIVES = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "HTML/CSS",
  "Git",
  "Docker",
  "Comunicação",
  "Liderança",
  "Resolução de Problemas",
  "Trabalho em Equipe",
]

export function OnboardingWizard({ isOpen, onComplete, onClose }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    nome: "",
    email: "",
    celular: "",
    cidade: "",
    isPCD: false,
    pcdType: "",
    adaptacoes: "",
    experiencia: "",
    anosExperiencia: 0,
    escolaridade: "",
    formacao: "",
    habilidades: [],
    testesRealizados: "",
  })

  const steps = [
    {
      id: 1,
      title: "Dados Pessoais",
      description: "Informações básicas sobre você",
    },
    {
      id: 2,
      title: "Dados Profissionais",
      description: "Experiência, formação e habilidades",
    },
    {
      id: 3,
      title: "Testes de Habilidades",
      description: "Valide suas competências técnicas",
    },
  ]

  const totalSteps = steps.length
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(data)
      onClose()
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleHabilidadeToggle = (habilidade: string) => {
    setData((prev) => ({
      ...prev,
      habilidades: prev.habilidades.includes(habilidade)
        ? prev.habilidades.filter((h) => h !== habilidade)
        : [...prev.habilidades, habilidade],
    }))
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return data.nome && data.email && data.celular && data.cidade && (!data.isPCD || data.pcdType)
      case 1:
        return data.escolaridade && data.formacao && data.habilidades.length > 0
      case 2:
        return true
      default:
        return false
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{steps[currentStep].title}</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{steps[currentStep].description}</span>
            <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Passo {currentStep + 1} de {totalSteps}
          </p>
        </div>

        {/* Step Content */}
        <div className="space-y-6 py-4">
          {currentStep === 0 && (
            <div className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  placeholder="Digite seu nome completo"
                  value={data.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={data.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              {/* Celular */}
              <div className="space-y-2">
                <Label htmlFor="celular">Celular *</Label>
                <Input
                  id="celular"
                  placeholder="(11) 99999-9999"
                  value={data.celular}
                  onChange={(e) => handleInputChange("celular", e.target.value)}
                />
              </div>

              {/* Cidade */}
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  placeholder="São Paulo"
                  value={data.cidade}
                  onChange={(e) => handleInputChange("cidade", e.target.value)}
                />
              </div>

              {/* PCD Section */}
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="isPCD"
                      checked={data.isPCD}
                      onCheckedChange={(checked) => handleInputChange("isPCD", checked)}
                    />
                    <Label htmlFor="isPCD" className="text-base font-medium cursor-pointer">
                      Sou pessoa com deficiência (PCD)
                    </Label>
                  </div>

                  {data.isPCD && (
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="pcdType">Tipo de deficiência *</Label>
                        <Input
                          id="pcdType"
                          placeholder="Ex: Visual, Auditiva, Física, Intelectual..."
                          value={data.pcdType}
                          onChange={(e) => handleInputChange("pcdType", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="adaptacoes">Necessidades de adaptação no ambiente de trabalho</Label>
                        <Textarea
                          id="adaptacoes"
                          placeholder="Descreva as adaptações necessárias para seu conforto e produtividade..."
                          value={data.adaptacoes}
                          onChange={(e) => handleInputChange("adaptacoes", e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Escolaridade */}
              <div className="space-y-2">
                <Label htmlFor="escolaridade">Escolaridade *</Label>
                <select
                  id="escolaridade"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  value={data.escolaridade}
                  onChange={(e) => handleInputChange("escolaridade", e.target.value)}
                >
                  <option value="">Selecione seu nível de escolaridade</option>
                  <option value="fundamental">Ensino Fundamental</option>
                  <option value="medio">Ensino Médio</option>
                  <option value="tecnico">Ensino Técnico</option>
                  <option value="superior">Ensino Superior</option>
                  <option value="pos-graduacao">Pós-graduação</option>
                </select>
              </div>

              {/* Formação */}
              <div className="space-y-2">
                <Label htmlFor="formacao">Formação/Profissão *</Label>
                <Input
                  id="formacao"
                  placeholder="Ex: Desenvolvedor, Designer, Gestor..."
                  value={data.formacao}
                  onChange={(e) => handleInputChange("formacao", e.target.value)}
                />
              </div>

              {/* Anos de Experiência */}
              <div className="space-y-2">
                <Label htmlFor="anosExperiencia">Anos de Experiência</Label>
                <Input
                  id="anosExperiencia"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={data.anosExperiencia}
                  onChange={(e) => handleInputChange("anosExperiencia", parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Experiência Descrição */}
              <div className="space-y-2">
                <Label htmlFor="experiencia">Descrição de Experiência</Label>
                <Textarea
                  id="experiencia"
                  placeholder="Descreva suas principais experiências profissionais..."
                  value={data.experiencia}
                  onChange={(e) => handleInputChange("experiencia", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Habilidades */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Habilidades *</Label>
                <p className="text-sm text-muted-foreground">Selecione as habilidades que você possui</p>
                <div className="grid grid-cols-2 gap-3">
                  {HABILIDADES_DISPONIVES.map((habilidade) => (
                    <div key={habilidade} className="flex items-center space-x-2">
                      <Checkbox
                        id={habilidade}
                        checked={data.habilidades.includes(habilidade)}
                        onCheckedChange={() => handleHabilidadeToggle(habilidade)}
                      />
                      <Label htmlFor={habilidade} className="font-normal cursor-pointer">
                        {habilidade}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Validação de Habilidades</CardTitle>
                  <CardDescription>
                    Realize testes para validar suas habilidades técnicas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Você selecionou as seguintes habilidades:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.habilidades.length > 0 ? (
                      data.habilidades.map((h) => (
                        <span
                          key={h}
                          className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {h}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Nenhuma habilidade selecionada</span>
                    )}
                  </div>

                  <div className="space-y-2 mt-6">
                    <Label htmlFor="testes">Iniciar Testes de Habilidades</Label>
                    <Textarea
                      id="testes"
                      placeholder="Os testes dinâmicos das suas habilidades serão apresentados aqui..."
                      value={data.testesRealizados}
                      onChange={(e) => handleInputChange("testesRealizados", e.target.value)}
                      rows={4}
                      disabled
                    />
                  </div>

                  <Button className="w-full">
                    Iniciar Testes de Habilidades
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex-1" />

          <Button
            onClick={handleNextStep}
            disabled={!isStepValid()}
            className="gap-2"
          >
            {currentStep === totalSteps - 1 ? "Concluir" : "Próximo"}
            {currentStep < totalSteps - 1 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
