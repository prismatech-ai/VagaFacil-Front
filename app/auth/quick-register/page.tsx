"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RegistroCandidatoStep1 } from "@/components/registro-candidato-step1"
import { SelecionaArea } from "@/components/seleciona-area"
import { AutoavaliacaoCompetencias } from "@/components/autoavaliacao-competencias"
import { Logo } from "@/components/logo"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type Step = "dados-pessoais" | "seleciona-area" | "avaliacao-competencias"

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
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [competenciasAvaliadas, setCompetenciasAvaliadas] = useState<any[]>([])
  
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

      setStep("seleciona-area")
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

  const handleSelecionaAreaComplete = (areas: string[]) => {
    setSelectedAreas(areas)
    setStep("avaliacao-competencias")
  }

  const handleCompetenciasComplete = (competencias: any[]) => {
    setCompetenciasAvaliadas(competencias)
    // Redirect ao dashboard após avaliar competências
    toast({
      title: "Cadastro concluído!",
      description: "Seu perfil foi atualizado com sucesso.",
    })
    router.push("/dashboard/candidato")
  }

  // Calcular progresso
  const steps: Step[] = ["dados-pessoais", "seleciona-area", "avaliacao-competencias"]
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

          {step === "seleciona-area" && (
            <SelecionaArea
              onComplete={handleSelecionaAreaComplete}
              isLoading={isLoading}
              multiple={true}
            />
          )}

          {step === "avaliacao-competencias" && (
            <AutoavaliacaoCompetencias
              areaId={selectedAreas[0]}
              onComplete={handleCompetenciasComplete}
              isLoading={isLoading}
            />
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
