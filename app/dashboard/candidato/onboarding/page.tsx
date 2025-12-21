"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import type { OnboardingProgresso, DadosPessoais, DadosProfissionais, TesteHabilidades } from "@/lib/types"
import { onboardingApi } from "@/lib/onboarding-api"
import testesApi from "@/lib/testes-api"

const TOTAL_STEPS = 3

const TIPOS_PCD = [
  { value: "Física", label: "Deficiência Física" },
  { value: "Auditiva", label: "Deficiência Auditiva" },
  { value: "Visual", label: "Deficiência Visual" },
  { value: "Intelectual", label: "Deficiência Intelectual" },
  { value: "Múltipla", label: "Deficiência Múltipla" },
  { value: "Psicossocial", label: "Transtorno Psicossocial" },
]

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [progresso, setProgresso] = useState<OnboardingProgresso | null>(null)

  // Dados pessoais (Step 1)
  const [dadosPessoais, setDadosPessoais] = useState<DadosPessoais>({
    phone: "",
    cidade: "",
    estado: "",
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    is_pcd: false,
    tipo_pcd: undefined,
    necessidades_adaptacao: "",
  })

  // Dados profissionais (Step 2)
  const [dadosProfissionais, setDadosProfissionais] = useState<DadosProfissionais>({
    experiencia_profissional: "",
    formacao_escolaridade: "",
  })

  // Teste (Step 3)
  const [dadosTeste, setDadosTeste] = useState<TesteHabilidades>({
    score: 0,
    dados_teste: undefined,
  })

  // Arquivo de currículo
  const [curriculoFile, setCurriculoFile] = useState<File | null>(null)

  // Rastreamento de conclusão de teste
  const [testeConcluido, setTesteConcluido] = useState(false)

  // Testes disponíveis
  const [testesDisponiveis, setTestesDisponiveis] = useState<any[]>([])
  const [testeSelecionado, setTesteSelecionado] = useState<any | null>(null)

  // Dialog de finalização
  const [mostrarDialogFinalizacao, setMostrarDialogFinalizacao] = useState(false)

  // Verificar autenticação e redirecionar se necessário
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "candidato")) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  // Carregar progresso ao montar
  useEffect(() => {
    carregarProgresso()
    carregarTestesDisponiveis()
  }, [])

  // Salvar status de testes no localStorage
  useEffect(() => {
    // Status é carregado do backend, não precisa salvar localmente
  }, [testeConcluido])

  const carregarTestesDisponiveis = async () => {
    const testes = await testesApi.listarTestes()
    setTestesDisponiveis(testes)
  }

  const carregarProgresso = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Carregar progresso real do backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/progresso`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const progressoData = await response.json()
        const progresso: OnboardingProgresso = {
          percentual_completude: progressoData.percentual_completude || 0,
          dados_pessoais_completo: progressoData.dados_pessoais_completo || false,
          dados_profissionais_completo: progressoData.dados_profissionais_completo || false,
          teste_habilidades_completo: progressoData.teste_habilidades_completo || false,
          onboarding_completo: progressoData.onboarding_completo || false,
          etapas_completas: {
            perfil_basico: false,
            dados_pessoais: progressoData.dados_pessoais_completo || false,
            dados_profissionais: progressoData.dados_profissionais_completo || false,
            teste_habilidades: progressoData.teste_habilidades_completo || false,
          },
        }
        setProgresso(progresso)
        
        // Atualizar status real dos testes
        setTesteConcluido(progressoData.teste_habilidades_completo)

        // Se já completou, redirecionar
        if (progressoData.onboarding_completo) {
          router.push("/dashboard/candidato")
        }
      }
    } catch (err) {
      console.error("Erro ao carregar progresso:", err)
    }
  }

  const carregarDadosTeste = async () => {
    try {
      // Tentar buscar os dados do teste da API
      const response = await fetch("/api/v1/candidates/onboarding/teste-resultado")
      if (response.ok) {
        const dados = await response.json()
        setDadosTeste(dados)
      }
    } catch (err) {
      // API não implementada ainda - silenciar erro
    }
  }

  const handleFazerTeste = async () => {
    try {
      // Buscar o primeiro teste de habilidades disponível
      const testeHabilidades = testesDisponiveis.find(t => t.tipo === "habilidades")
      
      if (!testeHabilidades) {
        toast({
          variant: "destructive",
          title: "Teste não disponível",
          description: "Nenhum teste de habilidades foi publicado ainda",
        })
        return
      }

      // Redirecionar para a página de testes para fazer o teste de verdade
      router.push("/dashboard/candidato/testes")
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao processar o teste",
      })
    }
  }

  const handleFinalizarAgora = async () => {
    setMostrarDialogFinalizacao(false)
    setLoading(true)

    try {
      // Finalizar onboarding completamente
      await onboardingApi.submeterTesteHabilidades(dadosTeste)
      await carregarProgresso()
      router.push("/dashboard/candidato")
    } catch (err) {
      // API não implementada ainda - prosseguir mesmo assim
      router.push("/dashboard/candidato")
    } finally {
      setLoading(false)
    }
  }

  const handleFinalizarDepois = () => {
    setMostrarDialogFinalizacao(false)
    toast({
      title: "Onboarding salvo",
      description: "Você pode completar o onboarding a qualquer momento. Estes testes são obrigatórios para se candidatar a vagas.",
    })
    // Redirecionar para dashboard sem finalizar o onboarding
    router.push("/dashboard/candidato")
  }

  // Mostrar loading enquanto verifica autenticação
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não for candidato, não renderiza (o useEffect vai redirecionar)
  if (user.role !== "candidato") {
    return null
  }

  const progress = (currentStep / TOTAL_STEPS) * 100

  const handleCurriculoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar se é PDF
    if (file.type !== "application/pdf") {
      toast({
        variant: "destructive",
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione um arquivo PDF",
      })
      return
    }

    // Validar tamanho máximo (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB",
      })
      return
    }

    setCurriculoFile(file)
  }

  const handleNext = async () => {
    setLoading(true)

    try {
      if (currentStep === 1) {
        // Validar e salvar dados pessoais
        if (!dadosPessoais.phone || !dadosPessoais.cidade || !dadosPessoais.estado || !dadosPessoais.cep || !dadosPessoais.logradouro || !dadosPessoais.numero || !dadosPessoais.bairro) {
          toast({
            variant: "destructive",
            title: "Campos obrigatórios",
            description: "Por favor, preencha todos os campos obrigatórios (telefone, cidade, estado, CEP, logradouro, número e bairro)",
          })
          setLoading(false)
          return
        }

        // Construir payload com todos os dados
        try {
          const payload = {
            phone: dadosPessoais.phone,
            rg: "",
            birth_date: "",
            genero: "",
            estado_civil: "",
            cep: dadosPessoais.cep,
            logradouro: dadosPessoais.logradouro,
            numero: dadosPessoais.numero,
            complemento: "",
            bairro: dadosPessoais.bairro,
            cidade: dadosPessoais.cidade,
            estado: dadosPessoais.estado,
            is_pcd: dadosPessoais.is_pcd,
            tipo_pcd: dadosPessoais.tipo_pcd || null,
            necessidades_adaptacao: dadosPessoais.necessidades_adaptacao || null,
          }

          const response = await fetch("/api/v1/candidates/onboarding/dados-pessoais", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          })

          if (!response.ok) {
            console.warn("Dados pessoais não sincronizados com o backend")
          }
        } catch (err) {
          // API não implementada ainda - silenciar erro
        }

        setCurrentStep(2)
      } else if (currentStep === 2) {
        // Validar e salvar dados profissionais
        if (
          !dadosProfissionais.experiencia_profissional ||
          !dadosProfissionais.formacao_escolaridade
        ) {
          toast({
            variant: "destructive",
            title: "Campos obrigatórios",
            description: "Por favor, preencha experiência e formação",
          })
          setLoading(false)
          return
        }

        // Construir payload completo com todos os dados
        try {
          const token = localStorage.getItem('token')
          
          // Validar e formatar habilidades
          const habilidadesFormatadas = (dadosProfissionais.habilidades || []).map((h: any) => ({
            habilidade: String(h.habilidade || ""),
            nivel: Number(h.nivel) as 1 | 2 | 3 | 4 | 5,
            anos_experiencia: Number(h.anos_experiencia || 0)
          }))
          
          const dadosProfissionaisPara = {
            bio: "",
            linkedin_url: "",
            portfolio_url: "",
            experiencia_profissional: dadosProfissionais.experiencia_profissional || "",
            formacao_escolaridade: dadosProfissionais.formacao_escolaridade || "",
            habilidades: habilidadesFormatadas,
          }

          console.log("Onboarding - Enviando dados profissionais:", dadosProfissionaisPara)

          // Sempre enviar como FormData para consistência
          const formData = new FormData()
          formData.append("dados", JSON.stringify(dadosProfissionaisPara))
          
          // Enviar arquivo de currículo se houver
          if (curriculoFile) {
            formData.append("curriculo", curriculoFile)
          }

          console.log("FormData enviado (onboarding/step2):")
          console.log("  - dados:", JSON.stringify(dadosProfissionaisPara))
          console.log("  - habilidades no dados:", habilidadesFormatadas)
          if (curriculoFile) console.log("  - curriculo:", curriculoFile.name, `(${(curriculoFile.size / 1024 / 1024).toFixed(2)}MB)`)
          console.log("  - URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/dados-profissionais`)
          
          // Log completo do FormData
          console.log("Conteúdo completo do FormData:")
          for (let [key, value] of formData.entries()) {
            console.log(`  ${key}:`, typeof value === 'string' ? value : value.name)
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/dados-profissionais`, {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
          })

          console.log("Resposta do onboarding step2:", response.status)

          if (!response.ok) {
            const errorText = await response.text()
            console.warn("❌ Erro ao sincronizar dados profissionais:", response.status, errorText)
          } else {
            const responseData = await response.json()
            console.log("✅ Dados profissionais salvos:", responseData)
          }
        } catch (syncErr) {
          console.error("❌ Erro ao sincronizar:", syncErr)
        }

        setCurrentStep(3)
      } else if (currentStep === 3) {
        // Finalizar onboarding - apenas confirmar
        try {
          await onboardingApi.submeterTesteHabilidades(dadosTeste)
          await carregarProgresso()
          router.push("/dashboard/candidato")
        } catch (err) {
          // API não implementada ainda - prosseguir mesmo assim
          router.push("/dashboard/candidato")
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao salvar dados"
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMsg,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      // Limpar arquivo se voltar do passo 2
      if (currentStep === 2) {
        setCurriculoFile(null)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-secondary/30 py-8">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">Bem-vindo ao VagaFácil!</CardTitle>
                <span className="text-sm text-muted-foreground">
                  Passo {currentStep} de {TOTAL_STEPS}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <CardDescription>Complete seu perfil para começar a encontrar as melhores oportunidades</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Passo 1: Dados Pessoais */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Compartilhe suas informações de contato e localização
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone/Celular *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 98765-4321"
                      value={dadosPessoais.phone || ""}
                      onChange={(e) => setDadosPessoais({ ...dadosPessoais, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      placeholder="São Paulo"
                      value={dadosPessoais.cidade || ""}
                      onChange={(e) => setDadosPessoais({ ...dadosPessoais, cidade: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado (UF) *</Label>
                    <Select value={dadosPessoais.estado || ""} onValueChange={(value) => setDadosPessoais({ ...dadosPessoais, estado: value })}>
                      <SelectTrigger id="estado">
                        <SelectValue placeholder="Selecione um estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BR.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={dadosPessoais.cep || ""}
                      onChange={(e) => setDadosPessoais({ ...dadosPessoais, cep: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro (Rua, Avenida, etc.) *</Label>
                    <Input
                      id="logradouro"
                      placeholder="Rua das Flores"
                      value={dadosPessoais.logradouro || ""}
                      onChange={(e) => setDadosPessoais({ ...dadosPessoais, logradouro: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      placeholder="123"
                      value={dadosPessoais.numero || ""}
                      onChange={(e) => setDadosPessoais({ ...dadosPessoais, numero: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
                      placeholder="Centro"
                      value={dadosPessoais.bairro || ""}
                      onChange={(e) => setDadosPessoais({ ...dadosPessoais, bairro: e.target.value })}
                    />
                  </div>
                </div>

                {/* Seção PCD */}
                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-semibold text-sm">Informações Adicionais</h4>
                  <p className="text-sm text-muted-foreground">
                    Você é uma pessoa com deficiência (PCD)? Essas informações ajudam empresas a oferecer adaptações adequadas.
                  </p>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dadosPessoais.is_pcd || false}
                        onChange={(e) =>
                          setDadosPessoais({
                            ...dadosPessoais,
                            is_pcd: e.target.checked,
                            tipo_pcd: e.target.checked ? undefined : undefined,
                            necessidades_adaptacao: e.target.checked ? "" : undefined,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span>Sou uma pessoa com deficiência</span>
                    </Label>
                  </div>

                  {dadosPessoais.is_pcd && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="tipo_pcd">Tipo de Deficiência *</Label>
                        <Select
                          value={dadosPessoais.tipo_pcd || ""}
                          onValueChange={(value) =>
                            setDadosPessoais({
                              ...dadosPessoais,
                              tipo_pcd: value as "Física" | "Auditiva" | "Visual" | "Intelectual" | "Múltipla" | "Psicossocial",
                            })
                          }
                        >
                          <SelectTrigger id="tipo_pcd">
                            <SelectValue placeholder="Selecione o tipo de deficiência" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_PCD.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="necessidades">Necessidades de Adaptação (opcional)</Label>
                        <Textarea
                          id="necessidades"
                          placeholder="Ex: Acesso em rampa, lugar próximo ao elevador, apoio na digitação..."
                          value={dadosPessoais.necessidades_adaptacao || ""}
                          onChange={(e) =>
                            setDadosPessoais({
                              ...dadosPessoais,
                              necessidades_adaptacao: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Passo 2: Dados Profissionais */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Dados Profissionais</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Conte-nos sobre sua experiência, formação e habilidades
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="experiencia">Experiência Profissional *</Label>
                    <Textarea
                      id="experiencia"
                      placeholder="Ex: 5 anos em desenvolvimento backend, 3 anos em Python, experiência com APIs REST..."
                      value={dadosProfissionais.experiencia_profissional || ""}
                      onChange={(e) =>
                        setDadosProfissionais({
                          ...dadosProfissionais,
                          experiencia_profissional: e.target.value,
                        })
                      }
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formacao">Formação Acadêmica *</Label>
                    <Textarea
                      id="formacao"
                      placeholder="Ex: Ensino Superior em Análise de Sistemas, Cursos complementares..."
                      value={dadosProfissionais.formacao_escolaridade || ""}
                      onChange={(e) =>
                        setDadosProfissionais({
                          ...dadosProfissionais,
                          formacao_escolaridade: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  {/* Upload de Currículo */}
                  <div className="space-y-2">
                    <Label htmlFor="curriculo">Currículo em PDF (opcional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer">
                      <input
                        id="curriculo"
                        type="file"
                        accept=".pdf"
                        onChange={handleCurriculoUpload}
                        className="hidden"
                      />
                      <label htmlFor="curriculo" className="cursor-pointer flex flex-col items-center gap-2">
                        <svg
                          className="w-8 h-8 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-7"
                          />
                        </svg>
                        <div className="text-center">
                          <p className="font-medium text-sm">
                            {curriculoFile ? curriculoFile.name : "Clique para selecionar um arquivo PDF"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {curriculoFile ? (
                              <span className="text-green-600">Arquivo selecionado ✓</span>
                            ) : (
                              "PDF até 5MB"
                            )}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>


                </div>
              </div>
            )}

            {/* Passo 3: Teste e Autoavaliação */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Teste e Autoavaliação</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Complete o teste de habilidades e a autoavaliação antes de finalizar seu onboarding
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Card Teste de Habilidades */}
                  <div className={`border-2 rounded-lg p-6 transition-all ${
                    testeConcluido
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 bg-white hover:border-primary/50"
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Teste de Habilidades</h4>
                        <p className="text-sm text-muted-foreground">
                          Avalie suas habilidades técnicas e profissionais através de um teste prático
                        </p>
                      </div>
                      {testeConcluido && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Concluído</span>
                        </div>
                      )}
                    </div>

                    {!testeConcluido ? (
                      <Button
                        onClick={handleFazerTeste}
                        className="w-full"
                      >
                        Fazer Teste
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                          ✓ Teste concluído com sucesso!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Resumo de Progresso */}
                  <div className={`border rounded-lg p-4 ${
                    testeConcluido
                      ? "bg-green-50 border-green-200"
                      : "bg-blue-50 border-blue-200"
                  }`}>
                    <h4 className="font-semibold text-sm mb-3">Progresso do Onboarding</h4>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Dados pessoais: Completo</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Dados profissionais: Completo</span>
                      </li>
                      <li className={`flex items-center gap-2 ${testeConcluido ? "text-green-700" : "text-gray-500"}`}>
                        <CheckCircle2 className={`h-4 w-4 ${testeConcluido ? "text-green-600" : "text-gray-300"}`} />
                        <span>Teste de habilidades: {testeConcluido ? "Completo" : "Pendente"}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Mensagem de conclusão */}
                  {testeConcluido && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-sm text-green-900">✓ Pronto para Finalizar!</h4>
                      <p className="text-sm text-green-800">
                        Todos os passos foram concluídos. Clique em "Finalizar" para completar seu onboarding.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navegação */}
            <div className="flex justify-between mt-8 pt-6 border-t gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>

              {currentStep === TOTAL_STEPS ? (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMostrarDialogFinalizacao(true)}
                    disabled={loading}
                  >
                    Finalizar Depois
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setMostrarDialogFinalizacao(true)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        Finalizar
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button type="button" onClick={handleNext} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Finalização */}
      <AlertDialog open={mostrarDialogFinalizacao} onOpenChange={setMostrarDialogFinalizacao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Onboarding?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <div className="text-sm text-muted-foreground">
                Você está prestes a completar seu onboarding. Saiba que estes testes (Teste de Habilidades e Autoavaliação) são <strong>obrigatórios para se candidatar a vagas</strong>.
              </div>
              <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                ⚠️ Se escolher "Finalizar Depois", você poderá completar o onboarding a qualquer momento no seu dashboard.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end pt-4">
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              onClick={handleFinalizarDepois}
            >
              Finalizar Depois
            </Button>
            <Button
              type="button"
              onClick={handleFinalizarAgora}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Finalizando...
                </>
              ) : (
                <>
                  Finalizar Agora
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

