"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail, Phone, MapPin } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"

interface CompanyData {
  razao_social?: string
  cnpj?: string
  nome_fantasia?: string
  setor?: string
  email?: string
  fone?: string
  cidade?: string
  estado?: string
  site?: string
  descricao?: string
  logo_url?: string
}

export default function ConfiguracoesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    razao_social: "",
    nome_fantasia: "",
    setor: "",
    email: "",
    fone: "",
    site: "",
    descricao: "",
    cidade: "",
    estado: "",
  })

  // Buscar dados da empresa ao montar o componente
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setIsLoadingData(true)
        const response = await api.get("/api/v1/companies/me") as CompanyData
        
        setFormData({
          razao_social: response.razao_social || "",
          nome_fantasia: response.nome_fantasia || "",
          setor: response.setor || "",
          email: response.email || "",
          fone: response.fone || "",
          site: response.site || "",
          descricao: response.descricao || "",
          cidade: response.cidade || "",
          estado: response.estado || "",
        })
        setError("")
      } catch (err) {
        console.error("Erro ao carregar dados da empresa:", err)
        setError("Erro ao carregar informações da empresa. Tente novamente.")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadCompanyData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const payload = {
        razao_social: formData.razao_social,
        nome_fantasia: formData.nome_fantasia,
        setor: formData.setor,
        email: formData.email,
        fone: formData.fone,
        site: formData.site,
        descricao: formData.descricao,
        cidade: formData.cidade,
        estado: formData.estado,
      }

      await api.put("/api/v1/companies/me", payload)
      setIsSaved(true)
      setError("")
      setIsEditing(false)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (err) {
      console.error("Erro ao salvar configurações:", err)
      setError("Erro ao salvar configurações. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações da Empresa</h1>
        <p className="text-gray-600 mt-2">Gerencie informações e preferências da sua empresa</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {isSaved && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✓ Configurações salvas com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoadingData ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-8">
            <div className="flex justify-center items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="text-gray-600">Carregando informações da empresa...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Company Info */}
          <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>Dados básicos da sua organização</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="razao_social">Razão Social</Label>
              <Input
                id="razao_social"
                name="razao_social"
                value={formData.razao_social}
                onChange={handleChange}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
              <Input
                id="nome_fantasia"
                name="nome_fantasia"
                value={formData.nome_fantasia}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setor">Setor</Label>
              <Input
                id="setor"
                name="setor"
                value={formData.setor}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Informações de Contato</CardTitle>
          <CardDescription>Como os candidatos entrarão em contato com você</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="fone"
                name="fone"
                value={formData.fone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Cidade
              </Label>
              <Input
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site">Website</Label>
              <Input
                id="site"
                name="site"
                type="url"
                value={formData.site}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Sobre a Empresa</CardTitle>
          <CardDescription>Descrição que aparecerá para candidatos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              disabled={!isEditing}
              rows={5}
              placeholder="Conte sobre sua empresa, missão, valores..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert className="border-[#24BFB0]/30 bg-[#25D9B8]/10">
        <AlertCircle className="h-4 w-4 text-[#03565C]" />
        <AlertDescription className="text-[#03565C]">
          <strong>Privacidade:</strong> Suas informações de contato serão compartilhadas com candidatos apenas após você demonstrar interesse em uma entrevista.
        </AlertDescription>
      </Alert>

        {/* Buttons */}
        <div className="flex gap-3">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="gap-2 bg-[#03565C] hover:bg-[#024147] px-8"
            >
              Editar Configurações
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="gap-2 bg-[#03565C] hover:bg-[#024147] px-8"
              >
                {isLoading ? "Salvando..." : "Salvar Configurações"}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
              >
                Cancelar
              </Button>
            </>
          )}
        </div>
        </>
      )}
    </div>
  )
}
