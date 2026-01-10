"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { CheckCircle2, AlertCircle, LogOut } from "lucide-react"

interface ContratacaoData {
  vaga_id: number
  vaga_titulo: string
  vaga_descricao: string
  empresa_id: number
  empresa_nome: string
  empresa_logo?: string
  data_contratacao: string
}

interface StatusPerfil {
  is_active: boolean
  foi_contratado: boolean
  data_contratacao?: string
  empresa_nome?: string
  vaga_titulo?: string
}

export function StatusPerfilCandidato() {
  const router = useRouter()
  const { logout } = useAuth()
  const [status, setStatus] = useState<StatusPerfil | null>(null)
  const [contratacao, setContratacao] = useState<ContratacaoData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReativating, setIsReativating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    setIsLoading(true)
    try {
      // Tenta buscar dados de contratação
      try {
        const contratacaoResponse = await api.get("/api/v1/candidato/contratacao")
        const contratacaoData = (contratacaoResponse as any).data || contratacaoResponse
        setContratacao(contratacaoData)
        setStatus({
          is_active: false,
          foi_contratado: contratacaoData.foi_contratado,
          data_contratacao: contratacaoData.data_contratacao,
          empresa_nome: contratacaoData.empresa_nome,
          vaga_titulo: contratacaoData.vaga_titulo
        })
      } catch (contratacaoError: any) {
        // Se for 404, significa que não foi contratado
        if (contratacaoError.status === 404 || contratacaoError.message?.includes("404")) {
          setStatus(null)
          return
        }
        
        // Se for outro erro, relança
        throw contratacaoError
      }
    } catch (error: any) {
      // Se for CORS ou fetch error, ignora silenciosamente
      if (error.message?.includes("CORS") || error.message?.includes("Failed to fetch")) {
        setStatus(null)
        return
      }
      
      // Se for 403, significa que é uma conta de empresa, não de candidato
      if (error.message?.includes("403") || error.status === 403) {
        setStatus(null)
        return
      }
      
      // Se falhar por outro motivo, desabilita o componente
      setStatus(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReativarPerfil = async () => {
    setIsReativating(true)
    try {
      const response = await api.put("/api/v1/candidato/reativar-perfil", {})
      const data = (response as any).data || response
      setStatus(data)
      toast({
        title: "Sucesso!",
        description: "Seu perfil foi reativado e você está visível para as empresas novamente.",
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erro ao reativar perfil"
      
      // Se for 403, não é candidato
      if (errorMsg.includes("403")) {
        toast({
          title: "Erro",
          description: "Apenas contas de candidato podem usar esta funcionalidade.",
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsReativating(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  useEffect(() => {
    // Status perfil candidato component effect
  }, [isLoading, status])

  if (isLoading) {
    return null
  }

  if (!status) {
    return null
  }

  // Se não foi contratado, não mostra nada
  if (!status.foi_contratado) {
    return null
  }

  // Se foi contratado - mostra modal bloqueante
  if (status.foi_contratado) {
    return (
      <>
        {/* Overlay escuro de fundo */}
        <div className="fixed inset-0 bg-black/50 z-40" />
        
        {/* Modal centralizado */}
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 space-y-6">
            {/* Header com ícone */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Você foi contratado!
              </h2>
            </div>

            {/* Mensagem principal */}
            <Alert className="border-blue-300 bg-blue-50">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-900 mt-2">
                Parabéns! Você foi selecionado por uma empresa e seu perfil foi desabilitado.
              </AlertDescription>
            </Alert>

            {/* Descrição */}
            <div className="space-y-3 text-gray-700 text-sm">
              <p>
                <strong>O que isso significa:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Seu perfil não será mais indicado para outras vagas</li>
                <li>Você está desabilitado de participar de novos processos</li>
                <li>Você pode reativar seu perfil a qualquer momento</li>
              </ul>
            </div>

            {/* Botão de ação */}
            <Button
              onClick={handleReativarPerfil}
              disabled={isReativating}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 h-auto"
            >
              {isReativating ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Reativando...
                </>
              ) : (
                "Quero Continuar nos Processos"
              )}
            </Button>

            {/* Botão de logout */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Deslogar do Sistema
            </Button>

            {/* Texto de rodapé */}
            <p className="text-xs text-gray-500 text-center">
              Ao clicar, seu perfil voltará a ser visível para as empresas
            </p>
          </div>
        </div>
      </>
    )
  }

  return null
}
