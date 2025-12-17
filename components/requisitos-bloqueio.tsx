"use client"

import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CandidatoRequisitos } from "@/lib/candidate-validation"
import { podeAplicarParaVaga, obterRequisitosPendentes } from "@/lib/candidate-validation"

interface RequisitosBloqueioProps {
  requisitos: CandidatoRequisitos
  onRedirectOnboarding?: () => void
}

export function RequisitosBloqueio({ requisitos, onRedirectOnboarding }: RequisitosBloqueioProps) {
  const podeAplicar = podeAplicarParaVaga(requisitos)
  const pendentes = obterRequisitosPendentes(requisitos)

  if (podeAplicar) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm text-green-900">Perfil Completo</p>
          <p className="text-sm text-green-800">Você está pronto para se candidatar para vagas!</p>
        </div>
      </div>
    )
  }

  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <p className="font-semibold">Requisitos não atendidos para candidaturas</p>
          <p className="text-sm text-red-900">
            Para se candidatar a vagas, você precisa completar:
          </p>
          <ul className="space-y-2">
            {pendentes.map((requisito) => (
              <li key={requisito} className="flex items-center gap-2 text-sm text-red-900">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600" />
                {requisito}
              </li>
            ))}
          </ul>
          {onRedirectOnboarding && (
            <Button
              onClick={onRedirectOnboarding}
              variant="outline"
              size="sm"
              className="mt-3 border-red-300 hover:bg-red-100 text-red-900"
            >
              Voltar para Onboarding
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
