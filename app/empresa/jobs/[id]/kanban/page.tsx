"use client"

import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import { KanbanVaga } from "@/components/kanban-vaga"

export default function JobKanbanPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const [candidatos, setCandidatos] = useState<any[]>([])

  const handleViewCandidate = (candidateId: string) => {
    router.push(`/empresa/jobs/${jobId}/candidates/${candidateId}`)
  }

  const handleMoveCandidate = (candidateId: string, newStatus: string) => {
    console.log(`Moved candidate ${candidateId} to ${newStatus}`)
    // In production, this would update the backend
  }

  return (
    <KanbanVaga
      vagaId={jobId}
      vagaTitulo="Desenvolvedor React Sênior"
      areaVaga="Frontend"
      candidatos={candidatos}
      onViewCandidato={handleViewCandidate}
    />
  )
}
