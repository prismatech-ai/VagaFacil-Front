"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { EmpresaSidebar } from "@/components/empresa-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Save, X } from "lucide-react"
import { toast } from "sonner"

interface EmpresaData {
  id: number
  user_id: number
  cnpj?: string
  razao_social?: string
  nome_fantasia?: string
  email: string
  fone?: string
  site?: string
  descricao?: string
  logo_url?: string
  cidade?: string
  estado?: string
  setor?: string
  is_verified?: boolean
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export default function PerfilEmpresaPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null)
  const [empresaId, setEmpresaId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    nome_fantasia: "",
    email: "",
    descricao: "",
    fone: "",
    site: "",
    cidade: "",
    estado: "",
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role !== "empresa") {
      router.push("/dashboard")
      return
    }

    if (user && user.role === "empresa") {
      loadEmpresa()
    }
  }, [user, isLoading, router])

  const loadEmpresa = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Token não encontrado")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      const meResponse = await fetch(`${apiUrl}/api/v1/companies/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (meResponse.status === 401) {
        toast.error("Sessão expirada")
        setTimeout(() => router.push("/login"), 2000)
        return
      }

      if (!meResponse.ok) {
        const errorText = await meResponse.text()
        console.error("Erro ao carregar empresa (me):", meResponse.status, errorText)
        toast.error("Erro ao carregar dados da empresa")
        return
      }

      const meData = await meResponse.json()
      const companyId = meData?.id

      if (!companyId) {
        toast.error("Empresa não encontrada")
        return
      }

      const publicResponse = await fetch(`${apiUrl}/api/v1/companies/${companyId}/public`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (publicResponse.status === 401) {
        toast.error("Sessão expirada")
        setTimeout(() => router.push("/login"), 2000)
        return
      }

      if (!publicResponse.ok) {
        const errorText = await publicResponse.text()
        console.error("Erro ao carregar empresa (public):", publicResponse.status, errorText)
        toast.error("Erro ao carregar dados da empresa")
        return
      }

      const data = await publicResponse.json()
      setEmpresa(data)
      setEmpresaId(companyId)
      setFormData({
        nome_fantasia: data.nome_fantasia || "",
        email: data.email || "",
        descricao: data.descricao || "",
        fone: data.fone || "",
        site: data.site || "",
        cidade: data.cidade || "",
        estado: data.estado || "",
      })
      if (data.logo_url) {
        setLogoPreview(data.logo_url)
      }
    } catch (error) {
      console.error("Erro ao buscar empresa:", error)
      toast.error("Erro ao buscar dados da empresa")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione uma imagem válida")
        return
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB")
        return
      }

      setLogoFile(file)

      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      if (!empresa) {
        toast.error("Dados da empresa não carregados")
        return
      }

      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Token não encontrado")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      const formDataToSend = new FormData()
      formDataToSend.append("nome_fantasia", formData.nome_fantasia)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("descricao", formData.descricao)
      formDataToSend.append("fone", formData.fone)
      formDataToSend.append("site", formData.site)
      formDataToSend.append("cidade", formData.cidade)
      formDataToSend.append("estado", formData.estado)
      formDataToSend.append("logo_url", logoPreview || empresa.logo_url || "")
      formDataToSend.append("id", String(empresa.id))
      formDataToSend.append("user_id", String(empresa.user_id))
      if (empresa.cnpj) formDataToSend.append("cnpj", empresa.cnpj)
      if (empresa.razao_social) formDataToSend.append("razao_social", empresa.razao_social)
      if (empresa.setor) formDataToSend.append("setor", empresa.setor)
      if (typeof empresa.is_verified === "boolean") {
        formDataToSend.append("is_verified", String(empresa.is_verified))
      }
      if (typeof empresa.is_active === "boolean") {
        formDataToSend.append("is_active", String(empresa.is_active))
      }
      if (empresa.created_at) formDataToSend.append("created_at", empresa.created_at)
      formDataToSend.append("updated_at", new Date().toISOString())
      if (logoFile) {
        formDataToSend.append("file", logoFile)
      }

      const response = await fetch(`${apiUrl}/api/v1/companies/me/logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (response.status === 401) {
        toast.error("✗ Sessão expirada", {
          description: "Por favor, faça login novamente",
          duration: 5000,
        })
        setTimeout(() => router.push("/login"), 2000)
        return
      }

      if (response.ok) {
        const data = await response.json()
        setEmpresa(data)
        setLogoFile(null)
        toast.success("✓ Alterações salvas com sucesso!", {
          description: "Os dados do seu perfil público foram atualizados",
          duration: 5000,
        })
      } else {
        const errorText = await response.text()
        console.error("Erro ao salvar empresa:", response.status, errorText)
        toast.error("✗ Erro ao salvar alterações", {
          description: `Código ${response.status}: ${errorText || response.statusText}`,
          duration: 6000,
        })
      }
    } catch (error) {
      console.error("Erro ao salvar empresa:", error)
      toast.error("✗ Erro ao processar requisição", {
        description: (error as Error).message || "Ocorreu um erro desconhecido",
        duration: 6000,
      })
    } finally {
      setSaving(false)
    }
  }

  const removeLogo = () => {
    setLogoPreview("")
    setLogoFile(null)
  }

  if (isLoading || !user || user.role !== "empresa" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-secondary/30">
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden">
          <EmpresaSidebar />

          <main className="flex-1 overflow-y-auto container mx-auto px-4 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Perfil da Empresa</h2>
              <p className="text-muted-foreground">Gerencie as informações e logo da sua empresa</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Card de Logo */}
              <Card>
                <CardHeader>
                  <CardTitle>Logo da Empresa</CardTitle>
                  <CardDescription>Faça upload do logo da sua empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    {logoPreview ? (
                      <div className="relative">
                        <Avatar className="h-32 w-32">
                          <AvatarImage src={logoPreview} alt="Logo da empresa" />
                          <AvatarFallback>Logo</AvatarFallback>
                        </Avatar>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 rounded-full h-8 w-8 p-0"
                          onClick={removeLogo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Avatar className="h-32 w-32">
                        <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                          {formData.nome_fantasia.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <Label htmlFor="logo-input" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-primary rounded-lg hover:bg-primary/5 transition">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Selecionar logo</span>
                      </div>
                    </Label>
                    <input
                      id="logo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />

                    <p className="text-xs text-muted-foreground text-center">
                      PNG, JPG, GIF até 5MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Informações */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Empresa</CardTitle>
                  <CardDescription>Atualize os dados da sua empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                    <Input
                      id="nome_fantasia"
                      name="nome_fantasia"
                      value={formData.nome_fantasia}
                      onChange={handleInputChange}
                      placeholder="Ex: Empresa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contato@empresa.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fone">Telefone</Label>
                    <Input
                      id="fone"
                      name="fone"
                      value={formData.fone}
                      onChange={handleInputChange}
                      placeholder="(11) 9999-9999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site">Website</Label>
                    <Input
                      id="site"
                      name="site"
                      value={formData.site}
                      onChange={handleInputChange}
                      placeholder="https://www.empresa.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleInputChange}
                        placeholder="São Paulo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        placeholder="SP"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Card de Descrição Institucional */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Descrição Institucional</CardTitle>
                <CardDescription>
                  Apresente sua empresa aos candidatos com uma descrição atraente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Sobre a Empresa</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    placeholder="Descreva sua empresa, missão, valores e cultura..."
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.descricao.length} caracteres
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">Pré-visualização:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                    {formData.descricao || "Sua descrição será exibida aqui..."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Botão Salvar */}
            <div className="flex justify-end gap-2 mt-8">
              <Button variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
