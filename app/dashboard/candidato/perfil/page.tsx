"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { CandidatoSidebar } from "@/components/candidato-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Save, Upload, X } from "lucide-react"
import type { Candidato, TipoPCD } from "@/lib/types"
import { TIPOS_PCD } from "@/lib/types"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function PerfilPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [candidato, setCandidato] = useState<Candidato | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [onboardingProgresso, setOnboardingProgresso] = useState<any>(null)

  // Estados para formulários
  const [formData, setFormData] = useState({
    id: 0,
    full_name: "",
    email: "",
    cpf: "",
    phone: "",
    rg: "",
    birth_date: "",
    genero: "",
    estado_civil: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    location: "",
    is_pcd: false,
    tipo_pcd: "",
    necessidades_adaptacao: "",
    bio: "",
    linkedin_url: "",
    portfolio_url: "",
    resume_url: "",
    experiencia_profissional: "",
    formacao_escolaridade: "",
    autoavaliacao_habilidades: "",
    teste_habilidades_completado: false,
    score_teste_habilidades: 0,
    percentual_completude: 0,
    onboarding_completo: false,
  })
  const [curriculoFile, setCurriculoFile] = useState<File | null>(null)
  const [uploadingCurriculo, setUploadingCurriculo] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const [educacaoDialogOpen, setEducacaoDialogOpen] = useState(false)
  const [experienciaDialogOpen, setExperienciaDialogOpen] = useState(false)

  const [novaEducacao, setNovaEducacao] = useState({
    instituicao: "",
    curso: "",
    nivel: "Superior",
    status: "Completo",
    ano_conclusao: new Date().getFullYear(),
  })

  const [novaExperiencia, setNovaExperiencia] = useState({
    empresa: "",
    cargo: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    atual: false,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role === "candidato") {
      loadPerfil()
      loadOnboarding()
    }
  }, [user, isLoading, router])

  const loadPerfil = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Buscar dados completos do onboarding que já retorna tudo
      const responseOnboarding = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!responseOnboarding.ok) {
        throw new Error('Falha ao carregar perfil do onboarding')
      }

      const onboardingData = await responseOnboarding.json()
      console.log('Dados do candidato (onboarding):', onboardingData)
      
      // Adicionar ID às formações acadêmicas se não tiverem
      const educacaoComId = (onboardingData.formacoes_academicas || []).map((edu: any, index: number) => ({
        ...edu,
        id: edu.id || `edu-${index}-${Date.now()}`
      }))
      
      // Adicionar ID às experiências profissionais se não tiverem e fazer parse do período
      const experienciasComId = (onboardingData.experiencias_profissionais || onboardingData.experiencias || []).map((exp: any, index: number) => {
        // Parse do período (exemplo: "2000-09-12 a 2025-09-12" ou "2025-01-15 a Atual")
        let dataInicio = ""
        let dataFim = null
        let atual = false
        
        if (exp.periodo && typeof exp.periodo === "string") {
          const partes = exp.periodo.split(" a ")
          dataInicio = partes[0] || ""
          if (partes[1]) {
            if (partes[1].toLowerCase() === "atual") {
              atual = true
              dataFim = null
            } else {
              dataFim = partes[1]
            }
          }
        }
        
        return {
          id: exp.id || `exp-${index}-${Date.now()}`,
          empresa: exp.empresa || "",
          cargo: exp.cargo || "",
          descricao: exp.descricao || "",
          dataInicio: dataInicio || exp.dataInicio || "",
          dataFim: dataFim || exp.dataFim || null,
          atual: atual || exp.atual || false
        }
      })
      
      setCandidato({
        ...onboardingData,
        habilidades: onboardingData.habilidades || [],
        educacao: educacaoComId,
        experiencias: experienciasComId
      })
      
      setFormData({
        id: onboardingData.id || 0,
        full_name: onboardingData.full_name || "",
        email: onboardingData.email || "",
        cpf: onboardingData.cpf || "",
        phone: onboardingData.phone || "",
        rg: onboardingData.rg || "",
        birth_date: onboardingData.birth_date || "",
        genero: onboardingData.genero || "",
        estado_civil: onboardingData.estado_civil || "",
        cep: onboardingData.cep || "",
        logradouro: onboardingData.logradouro || "",
        numero: onboardingData.numero || "",
        complemento: onboardingData.complemento || "",
        bairro: onboardingData.bairro || "",
        cidade: onboardingData.cidade || "",
        estado: onboardingData.estado || "",
        location: onboardingData.location || "",
        is_pcd: onboardingData.is_pcd || false,
        tipo_pcd: onboardingData.tipo_pcd || "",
        necessidades_adaptacao: onboardingData.necessidades_adaptacao || "",
        bio: onboardingData.bio || "",
        linkedin_url: onboardingData.linkedin_url || "",
        portfolio_url: onboardingData.portfolio_url || "",
        resume_url: onboardingData.resume_url || "",
        experiencia_profissional: onboardingData.experiencia_profissional || "",
        formacao_escolaridade: onboardingData.formacao_escolaridade || "",
        autoavaliacao_habilidades: onboardingData.autoavaliacao_habilidades || "",
        teste_habilidades_completado: onboardingData.teste_habilidades_completado || false,
        score_teste_habilidades: onboardingData.score_teste_habilidades || 0,
        percentual_completude: onboardingData.percentual_completude || 0,
        onboarding_completo: onboardingData.onboarding_completo || false,
      })
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar seu perfil. Tente novamente."
      })
    }
  }

  const loadOnboarding = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Carregar progresso do onboarding
      const responseStatus = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/progresso`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (responseStatus.ok) {
        const progressoData = await responseStatus.json()
        console.log('Progresso do onboarding:', progressoData)
        
        // Usar dados diretos da resposta
        const progresso = {
          percentual_completude: progressoData.percentual_completude || 0,
          dados_pessoais_completo: progressoData.dados_pessoais_completo || false,
          dados_profissionais_completo: progressoData.dados_profissionais_completo || false,
          teste_habilidades_completo: progressoData.teste_habilidades_completo || false,
          onboarding_completo: progressoData.onboarding_completo || false
        }
        
        setOnboardingProgresso(progresso)
      }
    } catch (error) {
      console.error("Erro ao carregar onboarding:", error)
    } finally {
    }
  }

  if (isLoading || !user || user.role !== "candidato") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const saveFormacoes = async (formacoes: any[], token: string) => {
    try {
      // Transformar formações para o formato esperado pela API
      const formacoesFormatadas = formacoes.map(f => ({
        instituicao: f.instituicao || "",
        curso: f.curso || "",
        nivel: f.nivel || "",
        status: f.status || "",
        ano_conclusao: f.ano_conclusao || new Date().getFullYear()
      }))

      const payload = {
        formacoes_academicas: formacoesFormatadas
      }

      console.log("📋 Formações originais:", formacoes)
      console.log("🔄 Formações formatadas:", formacoesFormatadas)
      console.log("📤 Payload a ser enviado (objeto/dicionário):", JSON.stringify(payload, null, 2))
      console.log("📍 URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/formacoes-academicas`)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/formacoes-academicas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      console.log("📊 Status da resposta:", response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ Erro ao salvar formações acadêmicas:")
        console.error("   Status:", response.status)
        console.error("   Resposta:", errorData)
        throw new Error(`Erro ao salvar formações acadêmicas: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      console.log('✅ Formações acadêmicas salvas com sucesso:', data)
      
      // Recarregar dados completos do candidato para refletir as formações salvas
      console.log("🔄 Recarregando dados do candidato...")
      await loadPerfil()
      
      return data
    } catch (error) {
      console.error("❌ Erro na função saveFormacoes:", error)
      throw error
    }
  }

  const saveExperiencias = async (experiencias: any[], token: string) => {
    try {
      // Formatar experiências com período como string conforme esperado pelo backend
      const payload = {
        experiencias_profissionais: experiencias.map(e => {
          // Criar string de período
          let periodoStr = e.dataInicio || ""
          if (e.atual) {
            periodoStr += " a Atual"
          } else if (e.dataFim) {
            periodoStr += ` a ${e.dataFim}`
          }
          
          return {
            cargo: e.cargo || "",
            empresa: e.empresa || "",
            periodo: periodoStr,
            descricao: e.descricao || ""
          }
        })
      }

      console.log("📋 Experiências a enviar:", experiencias)
      console.log("📤 Payload a ser enviado:", JSON.stringify(payload, null, 2))
      console.log("📍 URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/experiencias-profissionais`)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/experiencias-profissionais`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      console.log("📊 Status da resposta:", response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ Erro ao salvar experiências profissionais:")
        console.error("   Status:", response.status)
        console.error("   Resposta:", errorData)
        throw new Error(`Erro ao salvar experiências profissionais: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      console.log('✅ Experiências profissionais salvas com sucesso:', data)
      
      // Recarregar dados completos do candidato para refletir as experiências salvas
      console.log("🔄 Recarregando dados do candidato...")
      await loadPerfil()
      
      return data
    } catch (error) {
      console.error("❌ Erro na função saveExperiencias:", error)
      throw error
    }
  }

  // Função para normalizar tipo_pcd: remover acentos e converter para minúsculas
  const normalizeTipoPCD = (tipo: string): string => {
    return tipo
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
  }

  const savePCD = async (token: string) => {
    try {
      console.log("🔍 [savePCD] Dados no formData:")
      console.log("   - formData.is_pcd:", formData.is_pcd, typeof formData.is_pcd)
      console.log("   - formData.tipo_pcd:", formData.tipo_pcd, typeof formData.tipo_pcd)
      console.log("   - formData.necessidades_adaptacao:", formData.necessidades_adaptacao, typeof formData.necessidades_adaptacao)

      const payload = {
        is_pcd: formData.is_pcd,
        tipo_pcd: formData.is_pcd && formData.tipo_pcd ? normalizeTipoPCD(formData.tipo_pcd) : "",
        necessidades_adaptacao: formData.is_pcd && formData.necessidades_adaptacao ? formData.necessidades_adaptacao : ""
      }

      console.log("♿ [savePCD] Dados PCD a enviar no payload:")
      console.log("   - is_pcd:", payload.is_pcd, typeof payload.is_pcd)
      console.log("   - tipo_pcd:", payload.tipo_pcd, typeof payload.tipo_pcd)
      console.log("   - necessidades_adaptacao:", payload.necessidades_adaptacao, typeof payload.necessidades_adaptacao)
      console.log("📤 [savePCD] Payload completo:", JSON.stringify(payload, null, 2))
      console.log("📍 [savePCD] URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/dados-pessoais`)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/dados-pessoais`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      console.log("📊 [savePCD] Status da resposta PCD:", response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ [savePCD] Erro ao salvar dados PCD:")
        console.error("   Status:", response.status)
        console.error("   Resposta:", errorData)
        throw new Error(`Erro ao salvar dados PCD: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      console.log('✅ [savePCD] Resposta com sucesso:', JSON.stringify(data, null, 2))
      console.log('✅ [savePCD] Dados PCD salvos com sucesso!')
      
      // Recarregar dados completos do candidato
      console.log("🔄 [savePCD] Recarregando dados do candidato...")
      await loadPerfil()
      
      return data
    } catch (error) {
      console.error("❌ Erro na função savePCD:", error)
      throw error
    }
  }

  const handleSave = async () => {
    if (!candidato || !user) return

    console.log("💾 Iniciando salvamento com formData:", formData)
    console.log("🔍 Valores PCD no formData:")
    console.log("   - is_pcd:", formData.is_pcd, typeof formData.is_pcd)
    console.log("   - tipo_pcd:", formData.tipo_pcd, typeof formData.tipo_pcd)
    console.log("   - necessidades_adaptacao:", formData.necessidades_adaptacao, typeof formData.necessidades_adaptacao)
    
    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert("Token não encontrado")
        return
      }

      // Dados pessoais (PUT /api/v1/candidates/me)
      const dadosPessoais = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        rg: formData.rg,
        birth_date: formData.birth_date,
        genero: formData.genero,
        estado_civil: formData.estado_civil,
        cep: formData.cep,
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado
      }

      console.log("📝 Dados pessoais a enviar:", dadosPessoais)

      // Salvar dados pessoais
      const responsePessoais = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosPessoais)
      })

      console.log("📊 Status PUT dados pessoais:", responsePessoais.status)

      if (!responsePessoais.ok) {
        const errorData = await responsePessoais.text()
        console.error('❌ Erro ao salvar dados pessoais:', responsePessoais.status, errorData)
      } else {
        const responseJson = await responsePessoais.json()
        console.log("✅ Resposta da API ao salvar dados pessoais:", responseJson)
      }

      // Dados profissionais (POST /api/v1/candidates/onboarding/dados-profissionais)
      const dadosProfissionais = {
        bio: formData.bio || "",
        linkedin_url: formData.linkedin_url || "",
        portfolio_url: formData.portfolio_url || "",
        experiencia_profissional: formData.experiencia_profissional || "",
        formacao_escolaridade: formData.formacao_escolaridade || "",
        experiencias: candidato?.experiencias || []
      }

      console.log("Enviando dados profissionais:", dadosProfissionais)

      const formDataProfissional = new FormData()
      formDataProfissional.append("dados", JSON.stringify(dadosProfissionais))

      console.log("FormData enviado (perfil/handleSave):")
      console.log("  - dados:", JSON.stringify(dadosProfissionais))
      console.log("  - URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/dados-profissionais`)

      const responseProfissional = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/dados-profissionais`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataProfissional
      })

      console.log("Resposta do backend:", responseProfissional.status)

      if (!responseProfissional.ok) {
        const errorData = await responseProfissional.text()
        console.error("❌ Erro ao salvar dados profissionais:", responseProfissional.status, errorData)
        throw new Error(`Erro ao salvar dados profissionais: ${responseProfissional.status}`)
      }

      const updatedCandidato = await responseProfissional.json()
      console.log('Candidato atualizado:', updatedCandidato)
      
      // Salvar formações acadêmicas no endpoint específico
      if (candidato?.educacao && candidato.educacao.length > 0) {
        try {
          await saveFormacoes(candidato.educacao, token)
        } catch (error) {
          console.warn("⚠️ Aviso ao salvar formações acadêmicas:", error)
        }
      }
      
      // Salvar experiências profissionais no endpoint específico
      if (candidato?.experiencias && candidato.experiencias.length > 0) {
        try {
          await saveExperiencias(candidato.experiencias, token)
        } catch (error) {
          console.warn("⚠️ Aviso ao salvar experiências profissionais:", error)
        }
      }

      // Salvar dados PCD no endpoint específico
      try {
        await savePCD(token)
      } catch (error) {
        console.warn("⚠️ Aviso ao salvar dados PCD:", error)
      }

      // WORKAROUND: Se backend retorna habilidades como null/undefined,
      // preservar as que estão no estado local (já foram enviadas com sucesso)
      setCandidato(prev => ({
        ...updatedCandidato,
        habilidades: updatedCandidato.habilidades ?? prev?.habilidades ?? []
      }))
      setIsEditing(false)
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      })
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Erro ao salvar perfil: ${error instanceof Error ? error.message : 'Desconhecido'}`
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handlers para upload de currículo
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setCurriculoFile(file)
        uploadCurriculo(file)
      } else {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: "Por favor, envie um arquivo PDF"
        })
      }
    }
  }

  const handleCurriculoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setCurriculoFile(file)
        uploadCurriculo(file)
      } else {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: "Por favor, envie um arquivo PDF"
        })
      }
    }
  }

  const uploadCurriculo = async (file: File) => {
    if (!file) return

    // Validar tipo de arquivo
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Por favor, envie um arquivo PDF"
      })
      return
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O currículo não pode exceder 10MB"
      })
      return
    }

    setUploadingCurriculo(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Token não encontrado"
        })
        return
      }

      // Preparar dados profissionais em JSON conforme esperado pela API
      const dadosProfissionais = {
        bio: formData.bio || "",
        linkedin_url: formData.linkedin_url || "",
        portfolio_url: formData.portfolio_url || "",
        experiencia_profissional: formData.experiencia_profissional || "",
        formacao_escolaridade: formData.formacao_escolaridade || "",
        experiencias: candidato?.experiencias || []
      }

      console.log("Upload - Enviando dados profissionais:", dadosProfissionais)

      // Montar FormData conforme esperado pela API
      const formData_upload = new FormData()
      formData_upload.append("dados", JSON.stringify(dadosProfissionais))
      formData_upload.append("curriculo", file)

      console.log("FormData enviado (perfil/uploadCurriculo):")
      console.log("  - dados:", JSON.stringify(dadosProfissionais))
      console.log("  - curriculo:", file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      console.log("  - URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/dados-profissionais`)
      
      // Log completo do FormData
      console.log("Conteúdo completo do FormData:")
      for (let [key, value] of formData_upload.entries()) {
        console.log(`  ${key}:`, typeof value === 'string' ? value : value.name)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/candidates/onboarding/dados-profissionais`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData_upload,
      })

      console.log("Resposta do upload:", response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ Erro na resposta do servidor:", response.status, errorData)
        throw new Error(`Erro ao fazer upload do currículo: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Resposta do upload:', data)
      console.log('⚠️ Backend retornou habilidades?', data.habilidades)
      
      // WORKAROUND: Se backend retorna habilidades como null/undefined,
      // preservar as que estão no estado local (já foram enviadas com sucesso)
      setCandidato(prev => ({
        ...data,
        habilidades: data.habilidades ?? prev?.habilidades ?? []
      }))
      
      // Salvar formações acadêmicas no endpoint específico
      if (candidato?.educacao && candidato.educacao.length > 0) {
        await saveFormacoes(candidato.educacao, token)
      }
      
      // Salvar experiências profissionais no endpoint específico
      if (candidato?.experiencias && candidato.experiencias.length > 0) {
        await saveExperiencias(candidato.experiencias, token)
      }
      
      // Atualizar formData com todos os campos retornados
      setFormData({
        id: data.id || 0,
        full_name: data.full_name || "",
        email: data.email || "",
        cpf: data.cpf || "",
        phone: data.phone || "",
        rg: data.rg || "",
        birth_date: data.birth_date || "",
        genero: data.genero || "",
        estado_civil: data.estado_civil || "",
        cep: data.cep || "",
        logradouro: data.logradouro || "",
        numero: data.numero || "",
        complemento: data.complemento || "",
        bairro: data.bairro || "",
        cidade: data.cidade || "",
        estado: data.estado || "",
        location: data.location || "",
        is_pcd: data.is_pcd || false,
        tipo_pcd: data.tipo_pcd || "",
        necessidades_adaptacao: data.necessidades_adaptacao || "",
        bio: data.bio || "",
        linkedin_url: data.linkedin_url || "",
        portfolio_url: data.portfolio_url || "",
        resume_url: data.resume_url || "",
        experiencia_profissional: data.experiencia_profissional || "",
        formacao_escolaridade: data.formacao_escolaridade || "",
        autoavaliacao_habilidades: data.autoavaliacao_habilidades || "",
        teste_habilidades_completado: data.teste_habilidades_completado || false,
        score_teste_habilidades: data.score_teste_habilidades || 0,
        percentual_completude: data.percentual_completude || 0,
        onboarding_completo: data.onboarding_completo || false,
      })

      toast({
        title: "Sucesso!",
        description: "Currículo enviado com sucesso"
      })
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar o currículo. Tente novamente."
      })
    } finally {
      setUploadingCurriculo(false)
    }
  }

  const removeCurriculo = () => {
    setCurriculoFile(null)
    setFormData(prev => ({
      ...prev,
      resume_url: ""
    }))
    if (candidato) {
      setCandidato({
        ...(candidato as Candidato),
        resume_url: ""
      } as Candidato)
    }
  }

  const handleAddEducacao = () => {
    if (!candidato || !novaEducacao.instituicao || !novaEducacao.curso) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha instituição e curso"
      })
      return
    }

    const educacao = {
      id: Date.now().toString(),
      instituicao: novaEducacao.instituicao,
      curso: novaEducacao.curso,
      nivel: novaEducacao.nivel,
      status: novaEducacao.status,
      ano_conclusao: novaEducacao.ano_conclusao,
    }

    const updatedCandidato: Candidato = {
      ...candidato,
      educacao: [...(candidato.educacao || []), educacao],
    }

    setCandidato(updatedCandidato)
    setNovaEducacao({
      instituicao: "",
      curso: "",
      nivel: "Superior",
      status: "Completo",
      ano_conclusao: new Date().getFullYear(),
    })
    setEducacaoDialogOpen(false)
  }

  const handleAddExperiencia = () => {
    if (!candidato || !novaExperiencia.empresa || !novaExperiencia.cargo) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha empresa e cargo"
      })
      return
    }

    const experiencia = {
      id: Date.now().toString(),
      empresa: novaExperiencia.empresa,
      cargo: novaExperiencia.cargo,
      descricao: novaExperiencia.descricao || "",
      dataInicio: novaExperiencia.dataInicio || "",
      dataFim: novaExperiencia.atual ? null : (novaExperiencia.dataFim || null),
      atual: novaExperiencia.atual,
    }

    const updatedCandidato: Candidato = {
      ...candidato,
      experiencias: [...(candidato.experiencias || []), experiencia],
    }

    setCandidato(updatedCandidato)
    setNovaExperiencia({
      empresa: "",
      cargo: "",
      descricao: "",
      dataInicio: "",
      dataFim: "",
      atual: false,
    })
    setExperienciaDialogOpen(false)
  }

  const handleDeleteEducacao = (id: string) => {
    if (!candidato) return
    const updatedCandidato: Candidato = {
      ...candidato,
      educacao: candidato.educacao?.filter((e) => e.id !== id) || [],
    }
    setCandidato(updatedCandidato)
  }

  const handleDeleteExperiencia = (id: string) => {
    if (!candidato) return
    const updatedCandidato: Candidato = {
      ...candidato,
      experiencias: candidato.experiencias?.filter((e) => e.id !== id) || [],
    }
    setCandidato(updatedCandidato)
  }

  return (
    <SidebarProvider>
      <CandidatoSidebar />
      <div className="min-h-screen flex flex-col bg-secondary/30 w-full">
        <DashboardHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Meu Perfil</h2>
            <p className="text-muted-foreground">Gerencie suas informações profissionais</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          )}
        </div>

        {/* Progresso do Onboarding */}
        {onboardingProgresso && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Progresso do Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Completude</span>
                    <span className="text-sm font-bold text-blue-600">{onboardingProgresso.percentual_completude}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${onboardingProgresso.percentual_completude}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${onboardingProgresso.dados_pessoais_completo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">Dados Pessoais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${onboardingProgresso.dados_profissionais_completo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">Dados Profissionais</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="dados" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="profissional">Profissional</TabsTrigger>
            <TabsTrigger value="educacao">Educação</TabsTrigger>
            <TabsTrigger value="experiencia">Experiência</TabsTrigger>
          </TabsList>

          {/* Tab Dados Pessoais */}
          <TabsContent value="dados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Seus dados básicos de contato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" value={candidato?.full_name || candidato?.nome || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={candidato?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      disabled={!isEditing}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      value={formData.rg}
                      onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genero">Gênero</Label>
                    <Input
                      id="genero"
                      value={formData.genero}
                      onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    disabled={!isEditing}
                    placeholder="00000-000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={formData.logradouro}
                    onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Seção de Acessibilidade (PCD) */}
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-semibold mb-4">Informações de Acessibilidade</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="isPCD"
                      checked={formData.is_pcd}
                      onChange={(e) => setFormData({ ...formData, is_pcd: e.target.checked })}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="isPCD" className="cursor-pointer">
                      Sou uma Pessoa com Deficiência (PCD)
                    </Label>
                  </div>

                  {formData.is_pcd && (
                    <>
                      <div className="space-y-2 mb-4">
                        <Label htmlFor="tipoPCD">Tipo de Deficiência</Label>
                        <Select value={formData.tipo_pcd} onValueChange={(value) => setFormData({ ...formData, tipo_pcd: value as TipoPCD })}>
                          <SelectTrigger id="tipoPCD" disabled={!isEditing}>
                            <SelectValue placeholder="Selecione o tipo de deficiência" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_PCD.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="necessidadesAdaptacao">Necessidades de Adaptação</Label>
                        <Textarea
                          id="necessidadesAdaptacao"
                          value={formData.necessidades_adaptacao}
                          onChange={(e) => setFormData({ ...formData, necessidades_adaptacao: e.target.value })}
                          disabled={!isEditing}
                          rows={4}
                          placeholder="Descreva as adaptações que você necessita no ambiente de trabalho..."
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Profissional */}
          <TabsContent value="profissional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Profissionais</CardTitle>
                <CardDescription>Seu currículo, habilidades e links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / Resumo Profissional</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={6}
                    placeholder="Conte um pouco sobre você, suas experiências e objetivos profissionais..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">URL LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/seu-perfil"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">URL Portfólio</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://seuportifolio.com"
                  />
                </div>

                {/* Seção de Upload de Currículo */}
                <div className="space-y-2 mt-8 pt-8 border-t">
                  <Label htmlFor="curriculo">Currículo (PDF)</Label>
                  
                  {candidato?.resume_url || formData.resume_url ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900">
                            {curriculoFile?.name || formData.resume_url || "Currículo enviado"}
                          </p>
                          <p className="text-xs text-green-700">Arquivo carregado com sucesso</p>
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={removeCurriculo}
                          className="text-green-600 hover:text-red-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-gray-300 hover:border-primary/50"
                      } ${!isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="file"
                        id="curriculo"
                        accept=".pdf"
                        onChange={handleCurriculoChange}
                        disabled={!isEditing || uploadingCurriculo}
                        className="hidden"
                      />
                      
                      {uploadingCurriculo ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground">Enviando currículo...</p>
                        </div>
                      ) : (
                        <label
                          htmlFor="curriculo"
                          className={`flex flex-col items-center gap-2 ${isEditing ? "cursor-pointer" : ""}`}
                        >
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="font-semibold text-foreground">
                            Arraste seu currículo aqui
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ou clique para selecionar um arquivo PDF
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Máximo 10MB • Apenas PDF
                          </p>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Educação */}
          <TabsContent value="educacao" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Formação Acadêmica</CardTitle>
                  <CardDescription>Suas formações e cursos acadêmicos</CardDescription>
                </div>
                {isEditing && (
                  <Button onClick={() => setEducacaoDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {candidato?.educacao && candidato.educacao.length > 0 ? (
                  <div className="space-y-4">
                    {candidato.educacao.map((edu) => (
                      <div key={edu.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{edu.curso}</h4>
                            <p className="text-sm text-muted-foreground">{edu.instituicao}</p>
                            <p className="text-sm text-muted-foreground">
                              {edu.nivel} • {edu.status}
                            </p>
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => handleDeleteEducacao(edu.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Nenhuma formação cadastrada</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Experiência */}
          <TabsContent value="experiencia" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Experiência Profissional</CardTitle>
                  <CardDescription>Suas experiências de trabalho</CardDescription>
                </div>
                {isEditing && (
                  <Button onClick={() => setExperienciaDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {candidato?.experiencias && candidato.experiencias.length > 0 ? (
                  <div className="space-y-4">
                    {candidato.experiencias.map((exp) => (
                      <div key={exp.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{exp.cargo}</h4>
                            <p className="text-sm text-muted-foreground">{exp.empresa}</p>
                            <p className="text-sm text-muted-foreground">
                              {exp.dataInicio instanceof Date ? exp.dataInicio.toLocaleDateString("pt-BR") : exp.dataInicio} -{" "}
                              {exp.atual ? "Atual" : (exp.dataFim instanceof Date ? exp.dataFim.toLocaleDateString("pt-BR") : exp.dataFim) || ""}
                            </p>
                            {exp.descricao && <p className="text-sm mt-2">{exp.descricao}</p>}
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => handleDeleteExperiencia(exp.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Nenhuma experiência cadastrada</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Cursos */}
          <TabsContent value="cursos" className="space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Cursos e Certificações</CardTitle>
                  <CardDescription>Seus cursos e certificações</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">Nenhum curso cadastrado</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={educacaoDialogOpen} onOpenChange={setEducacaoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Formação</DialogTitle>
              <DialogDescription>Adicione uma nova formação acadêmica</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instituicao">Instituição</Label>
                <Input
                  id="instituicao"
                  value={novaEducacao.instituicao}
                  onChange={(e) => setNovaEducacao({ ...novaEducacao, instituicao: e.target.value })}
                  placeholder="Nome da instituição"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="curso">Curso</Label>
                <Input
                  id="curso"
                  value={novaEducacao.curso}
                  onChange={(e) => setNovaEducacao({ ...novaEducacao, curso: e.target.value })}
                  placeholder="Nome do curso"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nivel">Nível</Label>
                <Select
                  value={novaEducacao.nivel}
                  onValueChange={(v) =>
                    setNovaEducacao({
                      ...novaEducacao,
                      nivel: v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                    <SelectItem value="Superior">Superior</SelectItem>
                    <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
                    <SelectItem value="Mestrado">Mestrado</SelectItem>
                    <SelectItem value="Doutorado">Doutorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={novaEducacao.status}
                  onValueChange={(v) =>
                    setNovaEducacao({
                      ...novaEducacao,
                      status: v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completo">Completo</SelectItem>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Incompleto">Incompleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano_conclusao">Ano de Conclusão</Label>
                <Input
                  id="ano_conclusao"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 10}
                  value={novaEducacao.ano_conclusao}
                  onChange={(e) => setNovaEducacao({ ...novaEducacao, ano_conclusao: parseInt(e.target.value) || new Date().getFullYear() })}
                  placeholder="2023"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEducacaoDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddEducacao}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Adicionar Experiência */}
        <Dialog open={experienciaDialogOpen} onOpenChange={setExperienciaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Experiência</DialogTitle>
              <DialogDescription>Adicione uma nova experiência profissional</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={novaExperiencia.empresa}
                  onChange={(e) => setNovaExperiencia({ ...novaExperiencia, empresa: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={novaExperiencia.cargo}
                  onChange={(e) => setNovaExperiencia({ ...novaExperiencia, cargo: e.target.value })}
                  placeholder="Seu cargo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={novaExperiencia.descricao}
                  onChange={(e) => setNovaExperiencia({ ...novaExperiencia, descricao: e.target.value })}
                  rows={4}
                  placeholder="Descreva suas responsabilidades"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={novaExperiencia.dataInicio}
                  onChange={(e) => setNovaExperiencia({ ...novaExperiencia, dataInicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFim">Data de Término</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={novaExperiencia.dataFim}
                  onChange={(e) => setNovaExperiencia({ ...novaExperiencia, dataFim: e.target.value })}
                  disabled={novaExperiencia.atual}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="atual"
                  checked={novaExperiencia.atual}
                  onChange={(e) => setNovaExperiencia({ ...novaExperiencia, atual: e.target.checked })}
                />
                <Label htmlFor="atual">Trabalho atual</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setExperienciaDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddExperiencia}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      </div>
    </SidebarProvider>
  )
}
