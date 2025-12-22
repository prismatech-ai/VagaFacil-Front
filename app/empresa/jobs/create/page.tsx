"use client"

import { CadastroVaga } from "@/components/cadastro-vaga"

export default function CadastroVagaPage() {
  const handlePublish = (vaga: any) => {
    console.log("Vaga publicada:", vaga)
    // Aqui integraria com API para salvar a vaga
  }

  return <CadastroVaga onSubmit={handlePublish} />
}
