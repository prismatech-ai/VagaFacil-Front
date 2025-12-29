"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { TODAS_AREAS } from "@/lib/areas-competencias"
import { api } from "@/lib/api"

interface SelecionaAreaProps {
  onComplete: (areaId: string) => void
  isLoading?: boolean
}

// Áreas disponíveis baseadas no mapa de competências
const AREAS_DISPONIVEIS = TODAS_AREAS

export function SelecionaArea({ onComplete, isLoading = false }: SelecionaAreaProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedArea) {
      setSubmitting(true)
      try {
        // Enviar para API: POST /candidato/area-atuacao
        await api.post("/candidato/area-atuacao", { area: selectedArea })
        onComplete(selectedArea)
      } catch (error: any) {
        console.warn("Endpoint /candidato/area-atuacao não implementado ou indisponível, usando dados locais:", error?.message)
        // Fallback: usar dados locais se o endpoint não estiver disponível
        // Em produção, o backend deve implementar este endpoint
        onComplete(selectedArea)
      } finally {
        setSubmitting(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-secondary/30 py-8">
      <Card className="w-full max-w-2xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#03565C] to-[#24BFB0] text-white">
          <CardTitle className="text-2xl text-white">Qual é sua área de atuação?</CardTitle>
          <CardDescription className="text-white/90">
            Selecione a área onde você tem maior experiência
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Progress Indicator */}
          <div className="mb-8 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Etapa 1 de 3</span>
              <span className="text-gray-500">Seleção de Área</span>
            </div>
            <Progress value={33} className="h-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid de Áreas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AREAS_DISPONIVEIS.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setSelectedArea(area.id)}
                  disabled={isLoading || submitting}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedArea === area.id
                      ? "border-[#24BFB0] bg-[#25D9B8]/10 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  } ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold transition-colors ${
                        selectedArea === area.id ? "text-[#03565C]" : "text-gray-900"
                      }`}>
                        {area.nome}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{area.descricao}</p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 transition-all ${
                        selectedArea === area.id
                          ? "border-[#03565C] bg-[#03565C]"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedArea === area.id && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Info */}
            <Alert className="border-[#24BFB0]/30 bg-[#25D9B8]/10">
              <AlertCircle className="h-4 w-4 text-[#03565C]" />
              <AlertDescription className="text-[#03565C] text-sm">
                Você poderá ajustar sua área de atuação depois, durante a autoavaliação de competências.
              </AlertDescription>
            </Alert>

            {/* CTA */}
            <Button
              type="submit"
              disabled={!selectedArea || isLoading || submitting}
              className="w-full gap-2 bg-[#03565C] hover:bg-[#024147] py-6 text-base"
            >
              {submitting ? "Salvando..." : isLoading ? "Carregando..." : "Continuar com " + (selectedArea ? AREAS_DISPONIVEIS.find(a => a.id === selectedArea)?.nome : "seleção")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
