"use client"

import { useRouter } from "next/navigation"
import { ListaVagasEmpresa } from "@/components/lista-vagas-empresa"

export default function JobsListPage() {
  const router = useRouter()

  // Mock job data - matching the component's expected structure
  const mockJobs = [
    {
      id: "job-001",
      titulo: "Desenvolvedor React Sênior",
      area: "Frontend",
      descricao: "Procuramos um desenvolvedor React com experiência em TypeScript",
      dataCriacao: "2024-01-05",
      candidatosAlinhados: 5,
      candidatosComInteresse: 2,
      competenciasFiltros: ["React", "TypeScript", "Node.js"],
      status: "aberta" as const,
    },
    {
      id: "job-002",
      titulo: "Designer UX/UI",
      area: "Design",
      descricao: "Desenvolva experiências incríveis para nossos usuários",
      dataCriacao: "2024-01-03",
      candidatosAlinhados: 3,
      candidatosComInteresse: 1,
      competenciasFiltros: ["Figma", "Design System", "User Research"],
      status: "aberta" as const,
    },
    {
      id: "job-003",
      titulo: "Product Manager",
      area: "Produto",
      descricao: "Lidere o desenvolvimento de novos produtos",
      dataCriacao: "2024-01-01",
      candidatosAlinhados: 8,
      candidatosComInteresse: 3,
      competenciasFiltros: ["Gestão de produto", "Analytics", "Comunicação"],
      status: "aberta" as const,
    },
  ]

  const handleCreateJob = () => {
    router.push("/empresa/jobs/create")
  }

  const handleViewDetails = (jobId: string) => {
    router.push(`/empresa/jobs/${jobId}`)
  }

  const handleViewKanban = (jobId: string) => {
    router.push(`/empresa/jobs/${jobId}/kanban`)
  }

  return (
    <ListaVagasEmpresa
      vagas={mockJobs}
      onCreateVaga={handleCreateJob}
      onViewVaga={handleViewDetails}
      onViewKanban={handleViewKanban}
    />
  )
}

