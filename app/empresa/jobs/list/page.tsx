"use client"

import { useRouter } from "next/navigation"
import { ListaVagasEmpresa } from "@/components/lista-vagas-empresa"

export default function JobsListPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])

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
      vagas={jobs}
      onCreateVaga={handleCreateJob}
      onViewVaga={handleViewDetails}
      onViewKanban={handleViewKanban}
    />
  )
}

