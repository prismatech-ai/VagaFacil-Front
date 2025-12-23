"use client"

import { useRouter } from "next/navigation"
import { CadastroVaga } from "@/components/cadastro-vaga"

export default function CadastroVagaPage() {
  const router = useRouter()

  const handlePublish = (vaga: any) => {
    console.log("Vaga publicada:", vaga)
    // Aqui integraria com API para salvar a vaga
    // Após salvar, redireciona para lista de vagas
    router.push("/empresa/jobs/list")
  }

  return <CadastroVaga onSubmit={handlePublish} />
}
