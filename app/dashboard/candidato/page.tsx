"use client"

import { CandidatoDashboard } from "@/components/candidato-dashboard"

export default function CandidatoDashboardPage() {
  return (
    <CandidatoDashboard
      areaAtuacao="Frontend"
      nomeCompleto="João Silva"
      perfilCompleto={true}
    />
  )
}
