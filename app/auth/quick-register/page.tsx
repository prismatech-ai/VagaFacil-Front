"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RegistroCandidatoStep1 } from "@/components/registro-candidato-step1"
import { Logo } from "@/components/logo"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type Step = "dados-pessoais" | "dados-profissionais" | "formacoes" | "experiencias"

interface DadosPessoais {
  full_name: string
  email: string
  cpf: string
  phone: string
  rg: string
  birth_date: string
  genero: string
  estado_civil: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  is_pcd: boolean
  tipo_pcd: string
  necessidades_adaptacao: string
}

interface DadosProfissionais {
  bio: string
  linkedin_url: string
  portfolio_url: string
  resume_url: string
  experiencia_profissional: string
  formacao_escolaridade: string
}

interface Formacao {
  instituicao: string
  curso: string
  nivel: string
  status: string
  ano_conclusao: number
}

interface Experiencia {
  cargo: string
  empresa: string
  periodo: string
  descricao: string
}

interface Resposta {
  questao_id: number
  resposta: string
}

interface TesteHabilidades {
  test_id: number
  respostas: Resposta[]
  tempo_decorrido: number
}

export default function QuickRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<Step>("dados-pessoais")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState<string>("")
  
  const [dadosPessoais, setDadosPessoais] = useState<DadosPessoais>({
    full_name: "",
    email: "",
    cpf: "",
    phone: "",
    rg: "",
    birth_date: "",
    genero: "",
    estado_civil: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    is_pcd: false,
    tipo_pcd: "",
    necessidades_adaptacao: "",
  })

  const [dadosProfissionais, setDadosProfissionais] = useState<DadosProfissionais>({
    bio: "",
    linkedin_url: "",
    portfolio_url: "",
    resume_url: "",
    experiencia_profissional: "",
    formacao_escolaridade: "",
  })

  const [formacoes, setFormacoes] = useState<Formacao[]>([
    {
      instituicao: "",
      curso: "",
      nivel: "",
      status: "",
      ano_conclusao: new Date().getFullYear(),
    },
  ])

  const [experiencias, setExperiencias] = useState<Experiencia[]>([
    {
      cargo: "",
      empresa: "",
      periodo: "",
      descricao: "",
    },
  ])

  const [tempoInicio, setTempoInicio] = useState<number>(0)

  const handleDadosPessoaisComplete = async (data: any) => {
    setIsLoading(true)
    try {
      // Construir o payload completo conforme esperado pelo backend
      const registerPayload = {
        email: data.email || "",
        password: data.senha || "",
        nome: data.nome || "",
        role: "candidato",
        // Campos específicos de candidato
        telefone: data.telefone || "",
        cpf: data.cpf?.replace(/\D/g, "") || "",
        dataNascimento: data.dataNascimento || "",
        genero: data.genero || "",
        // Campos vazios de empresa (não se aplicam)
        razaoSocial: "",
        cnpj: "",
        rg: "",
        estadoCivil: "",
        setor: "",
        cepempresa: "",
        pessoaDeContato: "",
        foneempresa: "",
        // Endereço como objeto aninhado
        endereco: {
          cep: "",
          logradouro: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: data.cidade || "",
          estado: data.estado || "",
        },
      }
      console.log('📋 [Registro] Payload enviado:', registerPayload)
      console.log('🔍 [Registro] Dados brutos recebidos:', data)

      const registerUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`
      console.log('🚀 [Registro] URL:', registerUrl)
      
      const registerResponse = await fetch(registerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerPayload),
      })
      
      console.log('📡 [Registro] Status response:', registerResponse.status)

      if (!registerResponse.ok) {
        let errorData: any = {}
        try {
          errorData = await registerResponse.json()
        } catch (e) {
          const text = await registerResponse.text()
          console.error('❌ [Registro] Resposta em texto:', text)
          errorData = { text }
        }
        
        console.error('❌ [Registro] Erro detalhado completo:', JSON.stringify(errorData, null, 2))
        console.log('📋 [Registro] Payload enviado foi:', registerPayload)
        
        let errorMessage = `Erro ${registerResponse.status} ao registrar`
        if (errorData.detail) {
          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((err: any) => {
                if (err.msg) return `${err.loc?.join(" > ") || "Campo"}: ${err.msg}`
                return String(err)
              })
              .join("; ")
          }
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
        throw new Error(errorMessage)
      }

      const registerData = await registerResponse.json()
      console.log('✅ [Registro] Resposta completa:', registerData)
      
      const newUserId = registerData.id || registerData.user_id
      
      console.log('✅ [Registro] User ID obtido:', newUserId)
      setUserId(newUserId)

      // Armazenar dados pessoais no estado
      setDadosPessoais({
        full_name: data.nome || "",
        email: data.email || "",
        cpf: data.cpf || "",
        phone: data.telefone || "",
        rg: "",
        birth_date: data.dataNascimento || "",
        genero: data.genero || "",
        estado_civil: "",
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: data.cidade || "",
        estado: data.estado || "",
        is_pcd: data.temNecessidadesEspeciais || false,
        tipo_pcd: data.tipoNecessidade || "",
        necessidades_adaptacao: data.adaptacoes || "",
      })

      setStep("dados-profissionais")
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDadosProfissionaisSubmit = async () => {
    setIsLoading(true)
    setError("")
    try {
      console.log('📋 [Dados Profissionais] Payload enviado:', dadosProfissionais)
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/dados-profissionais?user_id=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(dadosProfissionais),
        }
      )
      console.log('📡 [Dados Profissionais] Status response:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erro ${response.status}`)
      }

      setStep("formacoes")
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }



  const handleFormacoesSubmit = async () => {
    setIsLoading(true)
    setError("")
    try {
      // Filtrar formações vazias e mapear para o formato esperado
      const formacoesValidas = formacoes
        .filter(f => f.instituicao.trim() || f.curso.trim() || f.nivel.trim())
        .map(f => ({
          instituicao: f.instituicao || "",
          curso: f.curso || "",
          nivel: f.nivel || "",
          status: f.status || "",
          ano_conclusao: f.ano_conclusao || new Date().getFullYear(),
          updated_at: new Date().toISOString(),
        }))

      const payload = { formacoes_academicas: formacoesValidas }
      console.log('📋 [Formações] Payload enviado:', payload)
      console.log('📊 [Formações] Total de formações:', formacoesValidas.length)
      
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/formacoes-academicas?user_id=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        }
      )
      console.log('📡 [Formações] Status response:', response.status)

      if (!response.ok) {
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch (e) {
          const text = await response.text()
          console.error('❌ [Formações] Resposta em texto:', text)
          errorData = { text }
        }
        console.error('❌ [Formações] Erro detalhado:', JSON.stringify(errorData, null, 2))
        throw new Error(errorData.detail || `Erro ${response.status}`)
      }

      setStep("experiencias")
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExperienciasSubmit = async () => {
    setIsLoading(true)
    setError("")
    try {
      // Filtrar experiências vazias
      const experienciasValidas = experiencias
        .filter(e => e.cargo.trim() || e.empresa.trim() || e.periodo.trim())
        .map(e => ({
          cargo: e.cargo || "",
          empresa: e.empresa || "",
          periodo: e.periodo || "",
          descricao: e.descricao || "",
          updated_at: new Date().toISOString(),
        }))

      const payload = { experiencias_profissionais: experienciasValidas }
      console.log('📋 [Experiências] Payload enviado:', payload)
      console.log('📊 [Experiências] Total de experiências:', experienciasValidas.length)
      
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/experiencias-profissionais?user_id=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        }
      )
      console.log('📡 [Experiências] Status response:', response.status)

      if (!response.ok) {
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch (e) {
          const text = await response.text()
          console.error('❌ [Experiências] Resposta em texto:', text)
          errorData = { text }
        }
        console.error('❌ [Experiências] Erro detalhado:', JSON.stringify(errorData, null, 2))
        throw new Error(errorData.detail || `Erro ${response.status}`)
      }

      toast({
        title: "Cadastro concluído!",
        description: "Seu perfil foi atualizado com sucesso.",
      })

      router.push("/dashboard/candidato")
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular progresso
  const steps: Step[] = ["dados-pessoais", "dados-profissionais", "formacoes", "experiencias"]
  const currentStepIndex = steps.indexOf(step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-secondary/30">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo width={180} />
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Etapa {currentStepIndex + 1} de {steps.length}
            </span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#03565C] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="w-full">
          {step === "dados-pessoais" && (
            <RegistroCandidatoStep1
              onComplete={handleDadosPessoaisComplete}
              isLoading={isLoading}
            />
          )}

          {step === "dados-profissionais" && (
            <Card>
              <CardHeader>
                <CardTitle>Dados Profissionais</CardTitle>
                <CardDescription>Compartilhe informações sobre sua carreira</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>Bio/Sobre você</Label>
                  <Textarea
                    placeholder="Conte um pouco sobre você..."
                    value={dadosProfissionais.bio}
                    onChange={(e) =>
                      setDadosProfissionais({ ...dadosProfissionais, bio: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL LinkedIn</Label>
                  <Input
                    placeholder="https://linkedin.com/in/seu-perfil"
                    value={dadosProfissionais.linkedin_url}
                    onChange={(e) =>
                      setDadosProfissionais({ ...dadosProfissionais, linkedin_url: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL Portfolio</Label>
                  <Input
                    placeholder="https://seuportfolio.com"
                    value={dadosProfissionais.portfolio_url}
                    onChange={(e) =>
                      setDadosProfissionais({ ...dadosProfissionais, portfolio_url: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL Currículo</Label>
                  <Input
                    placeholder="https://drive.google.com/..."
                    value={dadosProfissionais.resume_url}
                    onChange={(e) =>
                      setDadosProfissionais({ ...dadosProfissionais, resume_url: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Experiência Profissional (resumo)</Label>
                  <Textarea
                    placeholder="Descreva sua experiência..."
                    value={dadosProfissionais.experiencia_profissional}
                    onChange={(e) =>
                      setDadosProfissionais({
                        ...dadosProfissionais,
                        experiencia_profissional: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Formação/Escolaridade</Label>
                  <Input
                    placeholder="Ex: Graduação em Engenharia"
                    value={dadosProfissionais.formacao_escolaridade}
                    onChange={(e) =>
                      setDadosProfissionais({
                        ...dadosProfissionais,
                        formacao_escolaridade: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep("dados-pessoais")}
                    disabled={isLoading}
                  >
                    Voltar
                  </Button>
                  <Button onClick={handleDadosProfissionaisSubmit} disabled={isLoading} className="flex-1">
                    {isLoading ? "Salvando..." : "Continuar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "formacoes" && (
            <Card>
              <CardHeader>
                <CardTitle>Formações Acadêmicas</CardTitle>
                <CardDescription>Adicione suas formações (opcional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {formacoes.map((formacao, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                    <Input
                      placeholder="Instituição"
                      value={formacao.instituicao}
                      onChange={(e) => {
                        const newFormacoes = [...formacoes]
                        newFormacoes[idx].instituicao = e.target.value
                        setFormacoes(newFormacoes)
                      }}
                    />
                    <Input
                      placeholder="Curso"
                      value={formacao.curso}
                      onChange={(e) => {
                        const newFormacoes = [...formacoes]
                        newFormacoes[idx].curso = e.target.value
                        setFormacoes(newFormacoes)
                      }}
                    />
                    <Input
                      placeholder="Nível (Graduação, Pós-graduação, etc)"
                      value={formacao.nivel}
                      onChange={(e) => {
                        const newFormacoes = [...formacoes]
                        newFormacoes[idx].nivel = e.target.value
                        setFormacoes(newFormacoes)
                      }}
                    />
                    <Input
                      placeholder="Status (Concluído, Em andamento)"
                      value={formacao.status}
                      onChange={(e) => {
                        const newFormacoes = [...formacoes]
                        newFormacoes[idx].status = e.target.value
                        setFormacoes(newFormacoes)
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Ano de conclusão"
                      value={formacao.ano_conclusao}
                      onChange={(e) => {
                        const newFormacoes = [...formacoes]
                        newFormacoes[idx].ano_conclusao = parseInt(e.target.value) || 0
                        setFormacoes(newFormacoes)
                      }}
                    />
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() =>
                    setFormacoes([
                      ...formacoes,
                      {
                        instituicao: "",
                        curso: "",
                        nivel: "",
                        status: "",
                        ano_conclusao: new Date().getFullYear(),
                      },
                    ])
                  }
                  disabled={isLoading}
                >
                  + Adicionar Formação
                </Button>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep("dados-profissionais")}
                    disabled={isLoading}
                  >
                    Voltar
                  </Button>
                  <Button onClick={handleFormacoesSubmit} disabled={isLoading} className="flex-1">
                    {isLoading ? "Salvando..." : "Continuar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "experiencias" && (
            <Card>
              <CardHeader>
                <CardTitle>Experiências Profissionais</CardTitle>
                <CardDescription>Adicione suas experiências (opcional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {experiencias.map((experiencia, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                    <Input
                      placeholder="Cargo"
                      value={experiencia.cargo}
                      onChange={(e) => {
                        const newExperiencias = [...experiencias]
                        newExperiencias[idx].cargo = e.target.value
                        setExperiencias(newExperiencias)
                      }}
                    />
                    <Input
                      placeholder="Empresa"
                      value={experiencia.empresa}
                      onChange={(e) => {
                        const newExperiencias = [...experiencias]
                        newExperiencias[idx].empresa = e.target.value
                        setExperiencias(newExperiencias)
                      }}
                    />
                    <Input
                      placeholder="Período (ex: Jan 2020 - Dez 2021)"
                      value={experiencia.periodo}
                      onChange={(e) => {
                        const newExperiencias = [...experiencias]
                        newExperiencias[idx].periodo = e.target.value
                        setExperiencias(newExperiencias)
                      }}
                    />
                    <Textarea
                      placeholder="Descrição das responsabilidades e realizações"
                      value={experiencia.descricao}
                      onChange={(e) => {
                        const newExperiencias = [...experiencias]
                        newExperiencias[idx].descricao = e.target.value
                        setExperiencias(newExperiencias)
                      }}
                    />
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() =>
                    setExperiencias([
                      ...experiencias,
                      {
                        cargo: "",
                        empresa: "",
                        periodo: "",
                        descricao: "",
                      },
                    ])
                  }
                  disabled={isLoading}
                >
                  + Adicionar Experiência
                </Button>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep("formacoes")}
                    disabled={isLoading}
                  >
                    Voltar
                  </Button>
                  <Button onClick={handleExperienciasSubmit} disabled={isLoading} className="flex-1">
                    {isLoading ? "Salvando..." : "Continuar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
