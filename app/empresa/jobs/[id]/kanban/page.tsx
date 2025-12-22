"use client"

import { useRouter, useParams } from "next/navigation"
import { KanbanVaga } from "@/components/kanban-vaga"

export default function JobKanbanPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  // Mock candidates data (UUID only - anonymous)
  const mockCandidates = [
    {
      id: "uuid-001",
      status: "triagem",
      competencies: { "React": 4, "TypeScript": 4, "Node.js": 3 },
    },
    {
      id: "uuid-002",
      status: "triagem",
      competencies: { "React": 3, "TypeScript": 3, "Node.js": 4 },
    },
    {
      id: "uuid-003",
      status: "entrevista",
      competencies: { "React": 5, "TypeScript": 5, "Node.js": 4 },
    },
    {
      id: "uuid-004",
      status: "entrevista",
      competencies: { "React": 4, "TypeScript": 3, "Node.js": 3 },
    },
    {
      id: "uuid-005",
      status: "aprovado",
      competencies: { "React": 5, "TypeScript": 5, "Node.js": 5 },
    },
  ]

  const handleViewCandidate = (candidateId: string) => {
    router.push(`/empresa/jobs/${jobId}/candidates/${candidateId}`)
  }

  const handleMoveCandidate = (candidateId: string, newStatus: string) => {
    console.log(`Moved candidate ${candidateId} to ${newStatus}`)
    // In production, this would update the backend
  }

  const mockCandidatesFormatted = mockCandidates.map(c => ({
    id: c.id,
    candidatoId: c.id,
    competenciasDeclaradas: Object.keys(c.competencies),
    testes: Object.entries(c.competencies).map(([comp, score]) => ({ competencia: comp, score })),
    demonstrouInteresse: false,
    aceituEntrevista: false,
  }))

  return (
    <KanbanVaga
      vagaId={jobId}
      vagaTitulo="Desenvolvedor React Sênior"
      areaVaga="Frontend"
      candidatos={mockCandidatesFormatted}
      onViewCandidato={handleViewCandidate}
    />
  )
}
